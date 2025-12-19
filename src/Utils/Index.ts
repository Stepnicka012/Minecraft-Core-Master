export interface TaskItem<T> {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}
export function createTaskLimiter<T = unknown>(limit: number = 5) {
  let running = 0;
  const queue: TaskItem<T>[] = [];

  const runNext = () => {
    if (running >= limit || queue.length === 0) return;

    const { fn, resolve, reject } = queue.shift()!;
    running++;
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        running--;
        runNext();
      });
  };

  return function limitTask(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      process.nextTick(runNext);
    });
  };
}

export class TaskLimiter {
  private concurrency: number;
  private running: number = 0;
  private queue: Array<() => void> = [];
  constructor(concurrency: number) {
    if (concurrency < 1) {
      throw new Error('La concurrencia debe ser al menos 1');
    }
    this.concurrency = concurrency;
  }

  public limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = () => {
        this.running++;
        Promise.resolve(fn())
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.running--;
            this.dequeue();
          });
      };
      if (this.running < this.concurrency) {
        task();
      } else {
        this.queue.push(task);
      }
    });
  }

  private dequeue(): void {
    if (this.queue.length > 0 && this.running < this.concurrency) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
export function loader(type: string) {
  const data: Record<string, any> = {
    forge: {
      latest: 'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json',
      meta: 'https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json',
			install: 'https://maven.minecraftforge.net/net/minecraftforge/forge/${version}/forge-${version}-installer.jar',
			universal: 'https://maven.minecraftforge.net/net/minecraftforge/forge/${version}/forge-${version}-universal.jar',
			client: 'https://maven.minecraftforge.net/net/minecraftforge/forge/${version}/forge-${version}-client.jar'
    },
    neoforge: {
      meta: 'https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge',
      installer: 'https://maven.neoforged.net/releases/net/neoforged/neoforge/${version}/neoforge-${version}-installer.jar'
    },
    fabric: { 
      meta: 'https://meta.fabricmc.net/v2/versions',
      data: 'https://meta.legacyfabric.net/v2/versions/loader',
      installer: 'https://meta.fabricmc.net/v2/versions/loader/${game_version}/${loader_version}/installer/${installer_version}/fabric-installer.jar',
      json: 'https://meta.fabricmc.net/v2/versions/loader/${version}/${build}/profile/json'
    },
    legacyfabric: {
      meta: 'https://meta.legacyfabric.net/v2/versions',
      json: 'https://meta.legacyfabric.net/v2/versions/loader/${version}/${build}/profile/json'
    },
    quilt: {
			metaData: 'https://meta.quiltmc.org/v3/versions',
			json: 'https://meta.quiltmc.org/v3/versions/loader/${version}/${build}/profile/json'
    },
    curseforge: {
      api: "https://api.curseforge.com/v1"
    }
  };
  return data[type];
}
export const mirrors = [
  'https://maven.minecraftforge.net',
  'https://maven.neoforged.net/releases',
  'https://maven.creeperhost.net',
  'https://libraries.minecraft.net',
  'https://repo1.maven.org/maven2'
];