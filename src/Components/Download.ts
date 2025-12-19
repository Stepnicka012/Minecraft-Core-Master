import { EventEmitter } from 'events';
import { ClientDownloader } from "../Minecraft/Client.js";
import { LibrariesDownloader } from "../Minecraft/Libraries.js";
import { AssetsDownloader } from "../Minecraft/Assets.js";
import { NativesDownloader } from "../Minecraft/Natives.js";
import { RuntimeDownloader } from "../Minecraft/Runtime.js";

export interface ClientDownloaderOptions {
    version?: string;
    root?: string;
    concurry?: number | undefined;
    maxRetries?: number;
    decodeJson?: boolean | undefined;
}
export interface LibrariesDownloaderOptions {
    version?: string | undefined;
    root?: string | undefined;
    concurry?: number | undefined;
    maxRetries?: number;
}
export interface AssetsDownloaderOptions {
    version?: string;
    root?: string;
    concurry?: number | undefined;
    maxRetries?: number;
}
export interface NativesDownloaderOptions {
    version?: string;
    root?: string;
    concurry?: number | undefined;
    installBaseRoot?: boolean | undefined;
    maxRetries?: number;
}
export interface RuntimeDownloaderOptions {
    version?: string;
    root?: string;
    maxRetries?: number;
    concurry?: number | undefined;
}

interface DownloadSections {
    Client?: Partial<ClientDownloaderOptions>;
    Natives?: Partial<NativesDownloaderOptions>;
    Libraries?: Partial<LibrariesDownloaderOptions>;
    Runtime?: Partial<RuntimeDownloaderOptions>;
    Assets?: Partial<AssetsDownloaderOptions>;
}

interface DownloadOptions {
    root: string;
    version: string;
    concurry?: number;
    maxRetries?: number;
    installJava?: boolean;
    sections: DownloadSections;
}

interface NetworkWarning {
    type: 'high-concurry' | 'high-traffic' | 'connection-reset' | 'slow-download' | 'server-overload';
    message: string;
    severity: 'low' | 'medium' | 'high';
    data?: any;
}

class MinecraftDownloader extends EventEmitter {
    private downloaders: Map<string, any> = new Map();
    private totalBytes: number = 0;
    private downloadedBytes: number = 0;
    private isDownloading: boolean = false;
    public startTime: number = 0;
    private lastUpdateTime: number = 0;
    private lastDownloadedBytes: number = 0;
    private currentSpeed: number = 0;
    private eta: number = 0;
    private progressInterval: NodeJS.Timeout | null = null;
    private activeDownloads: Set<Promise<void>> = new Set();
    
    // Estadísticas para detección de problemas
    private connectionErrors: number = 0;
    private lastWarningTime: number = 0;
    private warningCooldown: number = 10000; // 10 segundos entre advertencias
    private highSpeedThreshold: number = 50 * 1024 * 1024; // 50 MB/s
    private slowSpeedThreshold: number = 100 * 1024; // 100 KB/s

    constructor() {
        super();
    }

    public getTotalMB(): string {
        return (this.totalBytes / (1024 * 1024)).toFixed(2);
    }

    public getTotalGB(): string {
        return (this.totalBytes / (1024 * 1024 * 1024)).toFixed(2);
    }

    public async StartDownload(options: DownloadOptions): Promise<void> {
        if (this.isDownloading) return;
        
        this.isDownloading = true;
        this.startTime = Date.now();
        this.lastUpdateTime = Date.now();
        this.lastDownloadedBytes = 0;
        this.downloadedBytes = 0;
        this.totalBytes = 0;
        this.connectionErrors = 0;

        // Verificar concurrencia alta ANTES de empezar
        this.checkconcurryWarning(options);

        this.emit("Start");

        try {
            // Calcular tamaño total exacto primero
            await this.calculateTotalSize(options);
            
            const totalMB = this.getTotalMB();
            const totalGB = this.getTotalGB();
            this.emit("TotalCalculated", { totalMB, totalGB });

            // Iniciar monitor de progreso
            this.startProgressMonitor();

            // Ejecutar descargas en paralelo
            await this.executeParallelDownloads();

            this.stopProgressMonitor();
            this.emit("Done");
        } catch (error) {
            this.stopProgressMonitor();
            this.emit("Error", error);
            throw error;
        } finally {
            this.isDownloading = false;
            this.activeDownloads.clear();
        }
    }

    private checkconcurryWarning(options: DownloadOptions): void {
        const totalConcurry = this.calculateTotalconcurry(options);
        
        if (totalConcurry > 50) {
            this.emitWarning({
                type: 'high-concurry',
                message: `Concurrencia muy alta detectada (${totalConcurry} conexiones). Puede causar problemas en los servidores.`,
                severity: 'high',
                data: { totalConcurry, recommended: 20 }
            });
        } else if (totalConcurry > 30) {
            this.emitWarning({
                type: 'high-concurry', 
                message: `Concurrencia elevada (${totalConcurry} conexiones). Monitoreando rendimiento.`,
                severity: 'medium',
                data: { totalConcurry, recommended: 20 }
            });
        }
    }

    private calculateTotalconcurry(options: DownloadOptions): number {
        const sections = options.sections || {};
        let total = 0;

        total += sections.Client?.concurry || options.concurry || 1;
        total += sections.Libraries?.concurry || options.concurry || 1;
        total += sections.Assets?.concurry || options.concurry || 1;
        total += sections.Natives?.concurry || options.concurry || 1;
        total += sections.Runtime?.concurry || options.concurry || 1;

        return total;
    }

    private emitWarning(warning: NetworkWarning): void {
        const now = Date.now();
        if (now - this.lastWarningTime < this.warningCooldown) {
            return; // Evitar spam de advertencias
        }

        this.lastWarningTime = now;
        this.emit("NetworkWarning", warning);
    }

    private async calculateTotalSize(options: DownloadOptions): Promise<void> {
        const sections = options.sections || {};
        
        const clientConfig: ClientDownloaderOptions = {
            version: options.version,
            root: options.root,
            decodeJson: sections.Client?.decodeJson || false,
            concurry: sections.Client?.concurry || options.concurry || 1,
            maxRetries: sections.Client?.maxRetries || options.maxRetries || 1
        };

        const librariesConfig: LibrariesDownloaderOptions = {
            version: options.version,
            root: options.root,
            concurry: sections.Libraries?.concurry || options.concurry || 1,
            maxRetries: sections.Libraries?.maxRetries || options.maxRetries || 1
        };

        const assetsConfig: AssetsDownloaderOptions = {
            version: options.version,
            root: options.root,
            concurry: sections.Assets?.concurry || options.concurry || 1,
            maxRetries: sections.Assets?.maxRetries || options.maxRetries || 1
        };

        const nativesConfig: NativesDownloaderOptions = {
            version: options.version,
            root: options.root,
            installBaseRoot: sections.Natives?.installBaseRoot || false,
            concurry: sections.Natives?.concurry || options.concurry || 1,
            maxRetries: sections.Natives?.maxRetries || options.maxRetries || 1
        };

        const runtimeConfig: RuntimeDownloaderOptions = {
            version: options.version,
            root: options.root,
            concurry: sections.Runtime?.concurry || options.concurry || 1,
            maxRetries: sections.Runtime?.maxRetries || options.maxRetries || 1
        };

        type DownloaderConfig = {
            name: string;
            class: any;
            config: any;
        };

        const downloadersConfig: DownloaderConfig[] = [
            { name: 'Client', class: ClientDownloader, config: clientConfig },
            { name: 'Libraries', class: LibrariesDownloader, config: librariesConfig },
            { name: 'Assets', class: AssetsDownloader, config: assetsConfig },
            { name: 'Natives', class: NativesDownloader, config: nativesConfig }
        ];

        if (options.installJava) {
            downloadersConfig.push({ 
                name: 'Runtime', 
                class: RuntimeDownloader, 
                config: runtimeConfig 
            });
        }

        for (const { name, class: DownloaderClass, config } of downloadersConfig) {
            try {
                const downloader = new DownloaderClass(config);
                const bytes = await downloader.getTotalBytes();
                this.totalBytes += bytes;
                
                this.emit("SectionSize", { name, size: this.formatBytes(bytes) });
                this.downloaders.set(name, downloader);
            } catch (error) {
                this.emit("SectionError", { name, error });
            }
        }
    }

    private async executeParallelDownloads(): Promise<void> {
        const downloadPromises: Promise<void>[] = [];

        for (const [name, downloader] of this.downloaders) {
            const promise = this.startSingleDownload(name, downloader);
            this.activeDownloads.add(promise);
            downloadPromises.push(promise);
            
            // Iniciar descarga inmediatamente
            promise.finally(() => {
                this.activeDownloads.delete(promise);
            });
        }

        // Esperar a que todas las descargas terminen
        await Promise.all(downloadPromises);
    }

    private async startSingleDownload(name: string, downloader: any): Promise<void> {
        return new Promise((resolve, reject) => {
            // Configurar event listeners para este descargador
            downloader.on("Bytes", (bytes: number) => {
                this.handleDownloadProgress(bytes);
            });

            downloader.on("Done", () => {
                this.emit("SectionDone", name);
                resolve();
            });

            downloader.on("Error", (error: any) => {
                this.handleDownloadError(name, error);
                this.emit("SectionError", { name, error });
                reject(error);
            });

            downloader.on("Paused", () => {
                this.emit("Paused");
            });

            downloader.on("Resumed", () => {
                this.emit("Resumed");
            });

            downloader.on("Stopped", () => {
                this.emit("Stopped");
                reject(new Error(`Descarga de ${name} detenida`));
            });

            // Iniciar descarga
            downloader.start().catch(reject);
        });
    }

    private handleDownloadError(section: string, error: any): void {
        this.connectionErrors++;
        
        // Detectar ECONNRESET específicamente
        if (error.code === 'ECONNRESET' || error.message?.includes('ECONNRESET')) {
            this.emitWarning({
                type: 'connection-reset',
                message: `El servidor cerró la conexión (${section}). Demasiadas peticiones simultáneas.`,
                severity: 'high',
                data: { section, errorCount: this.connectionErrors, error: error.message }
            });
        }

        // Advertencia después de múltiples errores
        if (this.connectionErrors >= 3) {
            this.emitWarning({
                type: 'server-overload',
                message: `Múltiples errores de conexión (${this.connectionErrors}). Los servidores pueden estar sobrecargados.`,
                severity: 'medium',
                data: { totalErrors: this.connectionErrors, section }
            });
        }
    }

    private handleDownloadProgress(bytes: number): void {
        this.downloadedBytes += bytes;
        
        // Calcular velocidad y ETA en tiempo real
        const now = Date.now();
        const timeDiff = (now - this.lastUpdateTime) / 1000; // en segundos
        
        if (timeDiff >= 0.5) { // Actualizar cada 500ms para mayor precisión
            const bytesDiff = this.downloadedBytes - this.lastDownloadedBytes;
            const speed = bytesDiff / timeDiff;
            
            // Detectar velocidad anormalmente alta
            if (speed > this.highSpeedThreshold) {
                this.emitWarning({
                    type: 'high-traffic',
                    message: `Tráfico de red muy alto (${this.formatBytes(speed)}/s). Puede saturar tu conexión.`,
                    severity: 'medium',
                    data: { speed, threshold: this.highSpeedThreshold }
                });
            }

            // Detectar velocidad muy lenta
            if (speed < this.slowSpeedThreshold && this.downloadedBytes > 1024 * 1024) {
                this.emitWarning({
                    type: 'slow-download',
                    message: `Velocidad de descarga muy lenta (${this.formatBytes(speed)}/s). Verifica tu conexión.`,
                    severity: 'low',
                    data: { speed, threshold: this.slowSpeedThreshold }
                });
            }
            
            this.currentSpeed = speed;
            
            if (speed > 0) {
                this.eta = (this.totalBytes - this.downloadedBytes) / speed;
            }
            
            this.lastUpdateTime = now;
            this.lastDownloadedBytes = this.downloadedBytes;

            // Emitir eventos de progreso
            this.emitProgress();
        }
    }

    private startProgressMonitor(): void {
        this.progressInterval = setInterval(() => {
            if (!this.isDownloading) {
                this.stopProgressMonitor();
                return;
            }
            
            // Emitir progreso actual incluso si no hay nuevos datos recientes
            this.emitProgress();
            
        }, 1000);
    }

    private stopProgressMonitor(): void {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    private emitProgress(): void {
        const downloadedMB = (this.downloadedBytes / (1024 * 1024)).toFixed(2);
        const downloadedGB = (this.downloadedBytes / (1024 * 1024 * 1024)).toFixed(2);
        const percentage = this.totalBytes > 0 ? ((this.downloadedBytes / this.totalBytes) * 100).toFixed(1) : "0.0";
        
        this.emit("Download-MB", downloadedMB);
        this.emit("Download-GB", downloadedGB);
        this.emit("SpeedDownload", this.formatBytes(this.currentSpeed));
        this.emit("ETA", Math.ceil(this.eta));
        this.emit("Percentage", percentage);
    }

    private formatBytes(bytes: number): string {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return Math.round(bytes) + ' B';
    }

    public pause(): void {
        for (const [_name, downloader] of this.downloaders) {
            if (downloader.pause) {
                downloader.pause();
            }
        }
        this.emit("Paused");
    }

    public resume(): void {
        for (const [_name, downloader] of this.downloaders) {
            if (downloader.resume) {
                downloader.resume();
            }
        }
        this.emit("Resumed");
    }

    public stop(): void {
        for (const [_name, downloader] of this.downloaders) {
            if (downloader.stop) {
                downloader.stop();
            }
        }
        this.stopProgressMonitor();
        this.isDownloading = false;
        this.activeDownloads.clear();
        this.emit("Stopped");
    }

    // Método para ajustar configuración basado en advertencias
    public adjustForNetworkIssues(): Partial<DownloadOptions> {
        return {
            concurry: Math.max(5, Math.floor(this.connectionErrors / 2)),
            maxRetries: 10 // Aumentar reintentos si hay problemas
        };
    }

    // Métodos adicionales para obtener información en tiempo real
    public getDownloadedMB(): string {
        return (this.downloadedBytes / (1024 * 1024)).toFixed(2);
    }

    public getDownloadedGB(): string {
        return (this.downloadedBytes / (1024 * 1024 * 1024)).toFixed(2);
    }

    public getPercentage(): string {
        return this.totalBytes > 0 ? ((this.downloadedBytes / this.totalBytes) * 100).toFixed(1) : "0.0";
    }

    public getCurrentSpeed(): string {
        return this.formatBytes(this.currentSpeed);
    }

    public getETA(): number {
        return Math.ceil(this.eta);
    }

    public isCurrentlyDownloading(): boolean {
        return this.isDownloading;
    }

    public getConnectionErrorCount(): number {
        return this.connectionErrors;
    }
}

export { MinecraftDownloader };