import { EventEmitter } from 'events';
import { createWriteStream } from 'fs';
import { mkdir, stat, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

interface VersionManifest {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: VersionInfo[];
}

interface VersionInfo {
  id: string;
  type: string;
  url: string;
  time: string;
  releaseTime: string;
}

interface VersionPackage {
  downloads: {
    server: {
      sha1: string;
      size: number;
      url: string;
    };
  };
}

interface ServerDownloaderOptions {
  version: string;
  root: string;
}

interface DownloadStats {
  downloaded: number;
  total: number;
  speed: number;
}

class ServerDownloader extends EventEmitter {
    private version: string;
    private root: string;
    private downloadPath: string;
    private jsonPath: string;
    private isDownloading: boolean = false;
    private isPaused: boolean = false;
    private isStopped: boolean = false;
    private controller?: AbortController | undefined;
    private lastBytes: number = 0;
    private lastTime: number = 0;
    private stats: DownloadStats = {
        downloaded: 0,
        total: 0,
        speed: 0
    };

    constructor(options: ServerDownloaderOptions) {
        super();
        this.version = options.version;
        this.root = options.root;
        this.downloadPath = join(this.root, 'server', 'versions', this.version, 'server.jar');
        this.jsonPath = join(this.root, 'server', 'versions', this.version, `${this.version}.json`); 
    }

    private async ensureDirectoryExists(): Promise<void> {
        const directory = dirname(this.downloadPath);
        await mkdir(directory, { recursive: true });
    }

    private async getVersionUrl(): Promise<string> {
        const response = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json');
        const manifest: VersionManifest = await response.json();
        
        const versionInfo = manifest.versions.find(v => v.id === this.version);
        if (!versionInfo) {
        throw new Error(`Versión ${this.version} no encontrada`);
        }
        
        return versionInfo.url;
    }

    private async getServerDownloadUrl(): Promise<{ url: string; size: number; versionData: any }> {
        const versionUrl = await this.getVersionUrl();
        const response = await fetch(versionUrl);
        const versionPackage: VersionPackage = await response.json();
        
        await this.ensureJsonDirectoryExists();
        await writeFile(this.jsonPath, JSON.stringify(versionPackage, null, 2));
        
        return {
            url: versionPackage.downloads.server.url,
            size: versionPackage.downloads.server.size,
            versionData: versionPackage
        };
    }

    private async ensureJsonDirectoryExists(): Promise<void> {
        const directory = dirname(this.jsonPath);
        await mkdir(directory, { recursive: true });
    }
    
    async getTotalBytes(): Promise<number> {
        const serverInfo = await this.getServerDownloadUrl();
        return serverInfo.size;
    }

    async start(): Promise<void> {
        if (this.isDownloading) {
        throw new Error('Ya hay una descarga en progreso');
        }

        this.isDownloading = true;
        this.isPaused = false;
        this.isStopped = false;
        this.controller = new AbortController();
        
        try {
        await this.ensureDirectoryExists();
        
        const serverInfo = await this.getServerDownloadUrl();
        this.stats.total = serverInfo.size;
        this.stats.downloaded = 0;
        this.stats.speed = 0;
        
        const response = await fetch(serverInfo.url, {
            signal: this.controller.signal
        });

        if (!response.ok) {
            throw new Error(`Error al descargar: ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error('No se pudo obtener el stream de descarga');
        }

        this.emit('Start');
        
        const reader = response.body.getReader();
        const fileStream = createWriteStream(this.downloadPath);
        this.lastTime = Date.now();
        this.lastBytes = 0;

        try {
            while (true) {
            while (this.isPaused && !this.isStopped) {
                this.emit('Paused');
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (this.isStopped) {
                this.emit('Stopped');
                break;
            }

            if (!this.isPaused && this.lastBytes > 0) {
                this.emit('Resumed');
            }

            const { done, value } = await reader.read();

            if (done) {
                this.emit('Done');
                break;
            }

            fileStream.write(value);
            this.stats.downloaded += value.length;
            
            const now = Date.now();
            const elapsed = (now - this.lastTime) / 1000;
            
            if (elapsed >= 1) {
                this.stats.speed = (this.stats.downloaded - this.lastBytes) / elapsed;
                this.lastTime = now;
                this.lastBytes = this.stats.downloaded;
            }
            
            this.emit('Bytes', this.stats.downloaded);
            this.emit('Progress', {
                downloaded: this.stats.downloaded,
                total: this.stats.total,
                speed: this.stats.speed,
                percentage: (this.stats.downloaded / this.stats.total) * 100
            });
            }
        } finally {
            fileStream.end();
            reader.releaseLock();
        }

        } catch (error: any) {
            if (error.name === 'AbortError' && this.isStopped) {
                this.emit('Stopped');
            } else {
                throw error;
            }
        } finally {
            this.isDownloading = false;
            this.controller = undefined;
        }
    }

    pause(): void {
        if (this.isDownloading && !this.isPaused) {
            this.isPaused = true;
        }
    }

    resume(): void {
        if (this.isDownloading && this.isPaused) {
            this.isPaused = false;
        }
    }

    stop(): void {
        if (this.isDownloading) {
            this.isStopped = true;
            this.controller?.abort();
        }
    }

    getDownloadPath(): string {
        return this.downloadPath;
    }

    getStats(): DownloadStats {
        return { ...this.stats };
    }

    async isDownloaded(): Promise<boolean> {
        try {
            const serverStats = await stat(this.downloadPath);
            const jsonStats = await stat(this.jsonPath);
            const serverInfo = await this.getServerDownloadUrl();
            
            return serverStats.size === serverInfo.size && jsonStats.size > 0;
        } catch {
            return false;
        }
    }
}

export default ServerDownloader;