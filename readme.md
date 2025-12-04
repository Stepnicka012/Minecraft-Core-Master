<p align="center">
    <img src="./docs/Logo/minecraft_tittle.png" width="500px" loading="lazy">
</p>

![Stable Version](https://img.shields.io/npm/v/minecraft-core-master?logo=nodedotjs&label=stable%20version)
[![npm downloads](https://img.shields.io/npm/dt/minecraft-core-master.svg)](https://www.npmjs.com/package/minecraft-core-master)

El **núcleo definitivo para launchers modernos**.
Un sistema **totalmente modular**, **rápido**, **escalable** y con **telemetría en tiempo real**, creado para desarrolladores que necesitan **descargar, preparar y ejecutar Minecraft** con precisión de nivel profesional, permite tanto **Inicio de Sesion** con **Mojang** y **Microsoft!**

Minecraft-Core-Master combina:
* **Un downloader paralelo ultra-optimizado**
* **Un sistema de ejecución con eventos avanzados**
* **Soporte completo para loaders modernos**
* **Analizadores internos de classpath, memoria, GPU y OpenGL**
* **Integridad, seguridad y sandboxing automático**
* **Estándares de ingeniería usados por launchers premium**

Todo dentro de una API compacta, extensible y extremadamente poderosa para Node.js.
Perfecto para **launchers de escritorio en Electron**, paneles de control, herramientas internas o plataformas de modding.


---

## ✨ ¿Qué hace diferente a Minecraft-Core-Master?

✔ **No es un wrapper.**
Es un **motor completo** que descarga, monta, ejecuta y analiza Minecraft desde cero.

✔ **Todo en paralelo.**
Cliente, assets, librerías, nativos y runtime Java descargan **al mismo tiempo**, con monitoreo profesional.

✔ **Eventos para absolutamente todo.**
Desde el ETA, tamaño exacto, velocidad, warnings de red, hasta loaders, FPS, GPU y chat del juego.

✔ **Compatible con Java 17+ y loaders modernos.**
Forge, Fabric, NeoForge, OptiFine, LegacyFabric y más funcionan sin configuraciones manuales.

✔ **Pensado para megaprojects.**
Ideal para launchers que quieran competir con CurseForge, Prism, ATLauncher, SKLauncher o cualquier otro.

## Instalación

```bash
npm install minecraft-core-master

pnpm install minecraft-core-master
```

<p align="center" style="font-size: 1.15rem; font-weight: 600;">
    ¿Te gusta Minecraft-Core-Master?<br>
    ¡Apoyá el proyecto y ayudá a que NovaStepStudios siga creciendo y mejorando aun mas al proyecto!
</p>

<p align="center">
    <a href="https://ko-fi.com/X8X31BPOT7" target="_blank">
        <img 
            src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" 
            alt="Apoyar en Ko-Fi" 
            height="42"     
            style="border:0; height:42px; margin-top: 6px;"
        />
    </a>
</p>


<p align="center">
    ¿Tienes dudas o quieres charlar con la comunidad? <br>
    Únete a nuestro <a href="https://discord.gg/37dYy9apwE" target="_blank">Discord</a> y recibe ayuda rápida, noticias y tips directamente de otros usuarios o de <strong>Stepnicka!</strong>
<p>
<p align="center">
  <img align="center" width="200px" src="./docs/Discord.gif">
  <p align="center">
    <a href="https://discord.gg/37dYy9apwE" target="_blank">
      <img src="https://img.shields.io/badge/Únete%20al%20Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" alt="Únete a Discord">
    </a>
  </p>
</p>

---

# Componentes de Minecraft-Core-Master

## MinecraftDownloader

El módulo `MinecraftDownloader` es un **gestor de descargas avanzado y totalmente paralelo para Minecraft**, capaz de manejar todas las partes necesarias para instalar y preparar una versión completa del juego.
Controla descargas masivas con **monitoreo en tiempo real**, detección de problemas de red, estadísticas avanzadas y eventos individuales para UI/launchers.

El downloader coordina automáticamente:

* **Cliente** (`client.jar`)
* **Librerías** (incluyendo mappings y dependencias transitivas)
* **Assets** (index + objetos)
* **Nativos** (extracción + limpieza)
* **Java Runtime** (opcional, descarga automática del JRE/JDK correcto)

Cada sección se descarga en paralelo y con su propia configuración independiente: concurrencia, reintentos, decodificación de JSON, etc.

### Funciones principales

* **Descargas paralelas reales** para todas las secciones al mismo tiempo.
* **Cálculo exacto del tamaño total** antes de empezar, para mostrar progreso real.
* **Sistema de advertencias inteligentes** que detecta:

  * Concurrencia demasiado alta
  * Velocidad extremadamente rápida o lenta
  * Conexiones cerradas por el servidor (ECONNRESET)
  * Saturación de tráfico
  * Sobrecarga de servidores externos
* **Monitoreo continuo de progreso:** MB, GB, velocidad, ETA, porcentaje.
* **Control del flujo:** pausar, reanudar y detener descargas en caliente.
* **Soporte opcional para autoinstalar Java**, usando Mojang Runtime.
* **Ajuste automático de configuración** si se detectan problemas de red.

### Eventos emitidos

El módulo emite eventos para actualizar UIs, terminales o dashboards en tiempo real:

* Inicio, finalización, pausado, reanudado, detenido.
* Progreso global: MB, GB, velocidad, ETA, porcentaje.
* Tamaño de cada sección.
* Errores por sección.
* Advertencias de red con severidad y explicación técnica.
* Listo para enganchar en launchers como StepLauncher o paneles avanzados.

### Flujo de trabajo interno

1. Valida concurrencia y genera advertencias si es excesiva.
2. Calcula el tamaño total sumando *todas* las secciones.
3. Crea cada downloader individual y los ejecuta en paralelo.
4. Monitorea velocidad, ETA y bytes descargados en intervalos constantes.
5. Emite eventos continuos para UIs en tiempo real.
6. Si hay problemas, ajusta automáticamente concurrencia y reintentos.
7. Finaliza cuando todas las promesas terminan.

### Ideal para

* Launchers personalizados (Electron, Node, Bun, etc.).
* Interfaces gráficas con barras múltiples de progreso.
* Descargas automáticas sin bloquear la UI.
* Sistemas que necesitan **eventos extremadamente detallados**.
* Launchers modernos que descargan cliente, assets, runtime y nativos al mismo tiempo.

```js
const { MinecraftDownloader } = require('minecraft-core-master');

const Downloader = new MinecraftDownloader();

// Inicio
Downloader.on("Start", () => {
    console.log("⬇️ Iniciando descarga...");
});

// Info de tamaño por sección
Downloader.on("Section-Info", (sec, size) => {
    console.log(`📁 Sección: ${sec} | Tamaño: ${size}`);
});

// Progreso en GB y MB
Downloader.on("Download-GB", b => {
    console.log(`📦 GB descargados: ${b}`);
});

Downloader.on("Download-MB", b => {
    console.log(`📦 MB descargados: ${b}`);
});

// Velocidad
Downloader.on("SpeedDownload", spd => {
    console.log(`⚡ Velocidad: ${spd}/s`);
});

// ETA (Tiempo en terminar la descarga, es un aproximado, no tirara datos 100% exactos) **Beta**
Downloader.on("ETA", sec => {
    if (!isFinite(sec) || sec < 0 || sec > 86400 * 30) {
        console.log("⏳ ETA: ∞");
    } else {
        console.log(`⏳ ETA: ${sec}s`);
    }
});

// Tamaño total
Downloader.on("TotalCalculated", data => {
    console.log(`📊 Total exacto: ${data.totalMB} MB (${data.totalGB} GB)`);
});

// Tamaño de sección
Downloader.on("SectionSize", data => {
    console.log(`📁 ${data.name}: ${data.size}`);
});

// Sección completada
Downloader.on("SectionDone", name => {
    console.log(`✅ Sección completada: ${name}`);
});

// Error en sección
Downloader.on("SectionError", data => {
    console.log(`❌ Error en sección ${data.name}:`, data.error);
});

Downloader.on("NetworkWarning", (warning) => {
    console.log(`⚠️ [${warning.severity.toUpperCase()}] ${warning.type}: ${warning.message}`);
    
    switch (warning.type) {
        case 'high-concurrency':
            console.log("💡 Recomendación: Reduce la concurrencia en la configuración");
            break;
        case 'connection-reset':
            console.log("💡 Recomendación: Los servidores están sobrecargados, intenta más tarde");
            break;
        case 'high-traffic':
            console.log("💡 Recomendación: Considera pausar otras descargas");
            break;
        case 'slow-download':
            console.log("💡 Recomendación: Verifica tu conexión a internet");
            break;
    }
});

// Pausa / Resume / Stop
Downloader.on("Paused", () => {
    console.log("⏸️ Pausado");
});

Downloader.on("Resumed", () => {
    console.log("▶️ Reanudado");
});

Downloader.on("Stopped", () => {
    console.log("🛑 Detenido");
});

// Fin
Downloader.on("Done", () => {
    console.log("🎉 Descarga completa");
    process.exit(0);
});

// EJECUCIÓN
(async () => {
    console.log("🧮 MB estimados:", Downloader.getTotalMB());
    console.log("🧮 GB estimados:", Downloader.getTotalGB());

    await Downloader.StartDownload({
        root: ".minecraft",
        version: "1.7.10",
        concurry: 8, // NO sobre pasarse oh tira error por mucha peticiones ala red
        maxRetries: 5,
        installJava: true,
        sections:{ // Configura cada seccion con tus propias config.
            Client:{
                concurry: 5,
                maxRetries: 10,
                decodeJson: false, // Decodificar el Json a UTF-8
            },
            Natives:{
                concurry: 5,
                maxRetries: 10,
            },
            Libraries:{
                concurry: 5,
                maxRetries: 10,
            },
            Runtime:{
                concurry: 5,
                maxRetries: 10,
            },
            Assets:{
                concurry: 5,
                maxRetries: 10,
            }
        }
    });
})();
```

---

## MinecraftLaunch

Este módulo proporciona una **clase completa para lanzar Minecraft con monitoreo en tiempo real**, emisión de eventos avanzados y análisis técnico automático.
Permite escuchar **todo lo que pasa durante el inicio, ejecución y cierre del juego**, desde progreso de descarga hasta FPS, chat, uso de memoria, OpenGL, classpath y mucho más.

Incluye tres niveles de eventos:

* **Eventos básicos:** estado, progreso, inicio, cierre y errores.
* **Eventos detallados:** fases del launcher, argumentos JVM/juego, tiempo por fases, classpath, rendimiento, memoria.
* **Eventos del juego:** carga del mundo, conexión a servidores, chat, FPS, chunks, GPU/OpenGL, advertencias de rendimiento.

La clase también ofrece:

* Monitoreo automático de **FPS, memoria, GPU, chunks, fases del launcher y procesos del juego**.
* Sistema de análisis del **classpath**, conflictos de versiones, librerías duplicadas y nativos.
* Emisión continua de métricas de rendimiento para debug avanzando.
* Callbacks opcionales para progreso y estado, ideal para integrarlo en interfaces visuales.

Perfecto para **launchers avanzados**, dashboards en tiempo real, sistemas de análisis o cualquier integración donde quieras saber EXACTAMENTE qué hace Minecraft segundo a segundo.

```js 
import { MinecraftLaunch, Mojang } from 'minecraft-core-master';

// Configuración básica
const User = await Mojang.login("Stepnicka012");
const basicLauncher = new MinecraftLaunch({
    gameRoot: '.minecraft',
    version: '1.12.2',
    user: User,
    memory: {
        min: '512M',
        max: '4G'
    },
    // Solo eventos simples
    enableDetailedEvents: false,
    enableTechnicalEvents: false,
    enableGameEvents: false,
    monitorPerformance: false
});

// Eventos Simples
basicLauncher.on('status', (message) => {
    console.log(`${message}`);
});

basicLauncher.on('progress', (type, percentage, currentFile) => {
    console.log(`${type}: ${percentage}% ${currentFile ? `- ${currentFile}` : ''}`);
});

basicLauncher.on('game-start', () => {
    console.log('¡Juego Iniciado!');
});

basicLauncher.on('game-exit', (code, signal) => {
    console.log(`Juego terminado - Código: ${code}, Señal: ${signal}`);
});

basicLauncher.on('error', (error) => {
    console.error('Error:', error.message);
});

// Función para iniciar
async function launchBasic() {
  try {
        console.log('Iniciando Minecraft en modo básico...');
        await basicLauncher.launch();
        // Opcional: Detener después de 5 minutos
        // setTimeout(() => {
        //     console.log('Deteniendo Minecraft después de 5 minutos...');
        // basicLauncher.kill();
        // }, 5 * 60 * 100);
    } catch (error) {
        console.error('Error al lanzar:', error);
    }
}

// Ejecutar
launchBasic();
```
## **Config de MinecraftLaunch**

```js
let launcherOptions = {
    gameRoot: '', // Carpeta raíz del juego
    version: '', // Versión de Minecraft a lanzar

    java: '', // Ruta al Java executable
    memory: {
        min: '', // Min heap
        max: ''  // Max heap
    },

    window: {
        width: 854,
        height: 480,
        fullscreen: false
    },

    override: {
        gameDirectory: '', // Carpeta donde se generan saves, resource packs, etc
        minecraftJar: '',
        versionJson: '',
        assetRoot: '',
        assetIndex: '',
        libraryRoot: '',
        natives: '',
        directory: '', // Donde se encuentra el jar y el version.json
    },

    JVM_ARGS: [], // Argumentos adicionales para JVM
    MC_ARGS: {}, // Argumentos adicionales para Minecraft

    proxy: {
        host: '',
        port: 0,
        username: '',
        password: '',
        type: 'socks5' // socks4 | socks5 | http
    },

    user: {
        name: '',
        uuid: '',
        accessToken: '',
        userType: 'mojang' // mojang | legacy | msa
    },

    features: {}, // Flags de características opcionales

    launcherName: '',
    launcherVersion: '',

    enforceSandbox: false,
    enableDebug: false,
    enableSpeedMetrics: false,

    // Opciones de eventos avanzados
    enableDetailedEvents: false,
    enableTechnicalEvents: false,
    enableGameEvents: false,
    monitorPerformance: false,
    monitorMemory: false,
    monitorNetwork: false,

    progressCallback: (type, progress) => {}, // Callback de progreso
    statusCallback: (message) => {} // Callback de estado
};

let launchResult = {
    emitter: null, // EventEmitter
    pid: 0,
    kill: () => true, // Método para cerrar el proceso
    stats: {
        totalTime: 0,
        phaseTimes: {}, // Fases y duración
        classpathCount: 0,
        libraryCount: 0
    }
};

let minecraftLaunchEvents = {
    status: (msg) => {},
    progress: (type, percentage, currentFile) => {},
    'game-start': () => {},
    'game-exit': (code, signal) => {},
    error: (err) => {},

    'debug:phase': (phase, duration, metadata) => {},
    'debug:libraries': (data) => {}, // { total, lwjgl[], natives[], classpath[] }
    'debug:arguments': (type, args, analysis) => {},
    'debug:performance': (metrics) => {}, // { totalTime, phaseTimes, memoryUsage }

    'game:loading': (stage, progress) => {},
    'game:world': (action, details) => {}, // action: creating | loading | joining
    'game:connection': (type, address) => {}, // type: server | realms | lan
    'game:performance': (fps, memory, chunkUpdates) => {},
    'game:chat': (message, type) => {}, // type: player | system | command

    'technical:classpath': (files, analysis) => {}, // analysis: ClasspathAnalysis
    'technical:memory': (usage, recommendations) => {}, // usage: MemoryMetrics
    'technical:render': (renderer, gpu, opengl) => {}
};

let ClasspathAnalysis = {
    totalJars: 0,
    missing: [],
    duplicates: [],
    versionConflicts: [],
    loadOrder: []
};

let MemoryMetrics = {
    heapUsed: 0,
    heapMax: 0,
    nativeUsed: 0,
    gcTime: 0,
    recommendation: 'OPTIMAL' // OPTIMAL | WARNING | CRITICAL
};
```


# Sistema de Eventos

Minecraft-Core-Master expone eventos detallados como:

* `on("download", ...)`
* `on("progress", ...)`
* `on("log", ...)`
* `on("perf", ...)`
* `on("state", ...)`
* `on("memory", ...)`
* `on("exit", ...)`

Esto permite integrar UI en tiempo real (Electron, React, WebView, etc).

# Telemetría del Juego (Real-Time Monitoring)

Incluye métricas internas de rendimiento:

* FPS
* RAM (Heap / MaxHeap)
* Chunks
* Performance del launch
* GC Time
* Recomendaciones automáticas
* Estados del juego (PREPARING / LOADING / DONE)

# Configuración Completa

Minecraft-Core-Master permite configurar:

* Ruta de Java
* Memoria asignada
* Argumentos del motor
* Argumentos del renderer
* Path de gameDir
* Paths personalizados (librerías, assets, runtimes)
* Validaciones de integridad
* Loaders automáticos

# **Eventos, Tipos y Config. de ``MinecraftLaunch``**

### LaunchOptions
| Opción                                          | Tipo                       | Descripción                                                         |
| ----------------------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| `enableDetailedEvents`                          | `boolean`                  | Activa eventos avanzados de depuración (fases, JARs, análisis).     |
| `enableTechnicalEvents`                         | `boolean`                  | Activa eventos técnicos del cliente (memoria, OpenGL, GPU, render). |
| `enableGameEvents`                              | `boolean`                  | Activa eventos en tiempo real del juego (carga, mundo, chat, FPS).  |
| `monitorPerformance`                            | `boolean`                  | Habilita monitoreo automático del rendimiento del juego cada 5s.    |
| `monitorMemory`                                 | `boolean`                  | Habilita medición avanzada del uso de memoria y recomendaciones.    |
| `monitorNetwork`                                | `boolean`                  | (Reservado) Activará en el futuro el monitoreo de paquetes/red.     |
| `progressCallback`                              | `(type, progress) => void` | Callback directo cuando progresa una descarga, fase o asset.        |
| `statusCallback`                                | `(message) => void`        | Callback directo cuando se emiten mensajes de estado.               |
| *(más opciones heredadas de `LauncherOptions`)* | `—`                        | Versiones, rutas, JVM, assets, javaPath, auth, etc.                 |

### MinecraftLaunchEvents
| Evento       | Argumentos                                                 | Descripción                               |
| ------------ | ---------------------------------------------------------- | ----------------------------------------- |
| `status`     | `(message: string)`                                        | Mensaje genérico de estado.               |
| `progress`   | `(type: string, percentage: number, currentFile?: string)` | Progreso de descargas o procesos.         |
| `game-start` | `()`                                                       | El juego inició correctamente.            |
| `game-exit`  | `(code, signal)`                                           | El proceso del juego terminó.             |
| `error`      | `(error: Error)`                                           | Error crítico en lanzamiento o ejecución. |

### Eventos detallados (Depuracion Avanzada) :
| Evento              | Argumentos                               | Descripción                             |
| ------------------- | ---------------------------------------- | --------------------------------------- |
| `debug:phase`       | `(phase, duration, metadata)`            | Inicio/fin de fases de lanzamiento.     |
| `debug:libraries`   | `{ total, lwjgl, natives, classpath }`   | Lista de librerías analizadas.          |
| `debug:arguments`   | `(type, args, analysis)`                 | Parámetros JVM o del juego construidos. |
| `debug:performance` | `{ totalTime, phaseTimes, memoryUsage }` | Métricas globales de rendimiento.       |

### Eventos del Juego en tiempo real :
| Evento             | Argumentos                    | Descripción                          |
| ------------------ | ----------------------------- | ------------------------------------ |
| `game:loading`     | `(stage, progress)`           | Etapas de carga del cliente.         |
| `game:world`       | `(action, details)`           | Mundo creado/cargando/uniéndose.     |
| `game:connection`  | `(type, address)`             | Conexión a servidores, Realms o LAN. |
| `game:performance` | `(fps, memory, chunkUpdates)` | FPS, memoria, chunks renderizados.   |
| `game:chat`        | `(message, type)`             | Mensajes del chat (jugador/sistema). |

### Eventos Tecnicos avanzados :
| Evento                | Argumentos                   | Descripción                               |
| --------------------- | ---------------------------- | ----------------------------------------- |
| `technical:classpath` | `(files, analysis)`          | Verificación completa del classpath.      |
| `technical:memory`    | `(metrics, recommendations)` | Estado avanzado de memoria + sugerencias. |
| `technical:render`    | `(renderer, gpu, opengl)`    | Información del renderizador y GPU.       |

### Tipos Internos :
**ClasspathAnalysis**
| Campo              | Tipo       |
| ------------------ | ---------- |
| `totalJars`        | `number`   |
| `missing`          | `string[]` |
| `duplicates`       | `string[]` |
| `versionConflicts` | `string[]` |
| `loadOrder`        | `string[]` |

**MemoryMetrics**
| Campo            | Tipo                                   |
| ---------------- | -------------------------------------- |
| `heapUsed`       | `number`                               |
| `heapMax`        | `number`                               |
| `nativeUsed`     | `number`                               |
| `gcTime`         | `number`                               |
| `recommendation` | `'OPTIMAL' \| 'WARNING' \| 'CRITICAL'` |

# **Eventos, Tipos y Configuración de `MinecraftDownloader`**

### ⚙️ **DownloaderOptions**

| Opción          | Tipo      | Descripción                                                                         |
| --------------- | --------- | ----------------------------------------------------------------------------------- |
| `root`          | `string`  | Carpeta `.minecraft` raíz donde se instala contenido.                               |
| `version`       | `string`  | Versión del juego a descargar (ej: `"1.20.4"`).                                     |
| `concurry`      | `number`  | Concurrencia global del downloader.                                                 |
| `maxRetries`    | `number`  | Intentos máximos por archivo fallado.                                               |
| `installJava`   | `boolean` | Le indica al módulo si debe descargar el Java Runtime apropiado.                    |
| `startOnFinish` | `boolean` | Si debe ejecutar Minecraft automáticamente al terminar.                             |
| `sections`      | `object`  | Configuración individual por sección (Client, Assets, Libraries, Natives, Runtime). |

### Configuración por sección (`sections.X`)

| Campo        | Tipo      | Descripción                              |
| ------------ | --------- | ---------------------------------------- |
| `concurry`   | `number`  | Concurrencia exclusiva para esa sección. |
| `maxRetries` | `number`  | Reintentos para esa sección.             |
| `decodeJson` | `boolean` | Para clientes antiguos (1.7–1.8).        |

# **Eventos emitidos por `MinecraftDownloader`**

Tu código ya usa todos estos eventos.
Ahora están documentados oficialmente para el README:


### Eventos básicos

| Evento    | Argumentos | Descripción                                   |
| --------- | ---------- | --------------------------------------------- |
| `Start`   | `()`       | Inicia el proceso de descarga.                |
| `Done`    | `()`       | Todas las secciones terminaron correctamente. |
| `Stopped` | `()`       | La descarga fue detenida manualmente.         |
| `Paused`  | `()`       | Pausa global en la descarga.                  |
| `Resumed` | `()`       | Reanudación de la descarga.                   |

### Eventos de progreso general

| Evento            | Argumentos             | Descripción                                        |
| ----------------- | ---------------------- | -------------------------------------------------- |
| `TotalCalculated` | `{ totalMB, totalGB }` | Tamaño exacto global calculado antes de descargar. |
| `Download-MB`     | `number`               | MB descargados actualmente.                        |
| `Download-GB`     | `number`               | GB descargados actualmente.                        |
| `SpeedDownload`   | `string`               | Velocidad actual (ej. `"12.4MB"`).                 |
| `ETA`             | `number`               | Tiempo estimado en segundos (∞ si es inestable).   |

### Eventos por sección

| Evento         | Argumentos        | Descripción                                    |
| -------------- | ----------------- | ---------------------------------------------- |
| `Section-Info` | `(name, size)`    | Información inicial de la sección.             |
| `SectionSize`  | `{ name, size }`  | Tamaño total real de esa sección.              |
| `SectionDone`  | `name`            | Una sección terminó (Client, Libraries, etc.). |
| `SectionError` | `{ name, error }` | Error en una sección específica.               |

### Eventos de red / advertencias inteligentes

| Evento           | Argumentos                    | Descripción                                 |
| ---------------- | ----------------------------- | ------------------------------------------- |
| `NetworkWarning` | `{ type, severity, message }` | Problemas de red detectados en tiempo real. |

### Tipos posibles:

* `high-concurrency` → demasiadas peticiones simultáneas
* `connection-reset` → servidores saturados o cerrando conexiones
* `high-traffic` → ancho de banda al límite
* `slow-download` → velocidad muy baja

### Tipos internos del downloader

### DownloadSizeInfo

| Campo     | Tipo     |
| --------- | -------- |
| `totalMB` | `number` |
| `totalGB` | `number` |

### NetworkWarning

| Campo      | Tipo                |                 |         |
| ---------- | ------------------- | --------------- | ------- |
| `type`     | `'high-concurrency' | 'slow-download' | ...`    |
| `severity` | `'low'              | 'medium'        | 'high'` |
| `message`  | `string`            |                 |         |


**Ejemplos Completos y Detallados**
```bash
GITHUB
├───Auth
│       Microsoft.cjs
│       Mojang.cjs
│       
├───Components
│       Assets.cjs
│       Client.cjs
│       Libraries.cjs
│       Natives.cjs
│       Runtime.cjs
│
├───Core
│       Arguments-MoreDetail.cjs
│       Arguments.cjs
│       Arguments.md
│
└───Start
        Download.cjs
        Launch-Advanced.js
        Launch-Basic.js
```

**Estructura del Proyecto**
```bash
Minecraft-Core-Master
│   Index.ts (ENTRY POINT)
│   
├───Authenticator
│   │   AZauth.ts
│   │   Microsoft.ts
│   │   Mojang.ts
│   │   
│   └───UI
│           Electron.ts
│           NW.ts
│           Terminal.ts
│
├───Components
│       Download.ts
│       Launch.ts
│       Loader.ts
│       
├───Minecraft
│       Arguments.ts
│       Assets.ts
│       LibraryBuyer.ts
│       Libraries.ts
│       Natives.ts
│       Runtime.ts
│       Version.ts
│
└───Utils
        Index.ts
        Status.ts
        Unzipper.ts
```