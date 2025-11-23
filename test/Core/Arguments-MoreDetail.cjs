const { Mojang } = require("../../dist/Index.js");
const { ArgumentsBuilder } = require("../../dist/Minecraft/Arguments");

// Configuración de colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

class MinecraftLogger {
  constructor() {
    this.startTime = Date.now();
    this.phases = new Map();
    this.libraries = [];
    this.classpathFiles = [];
    this.errors = [];
    this.warnings = [];
    this.gameOutput = [];
    this.systemOutput = [];
  }

  log(emoji, color, category, message, details = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${colors[color]}${emoji} [${timestamp}] ${category}: ${message}${colors.reset}`;
    console.log(logMessage);
    
    if (details) {
      if (typeof details === 'object') {
        console.log(colors.cyan + '   Detalles:' + colors.reset);
        this.printObject(details, 3);
      } else {
        console.log(colors.cyan + `   ${details}` + colors.reset);
      }
    }
  }

  printObject(obj, indent = 0) {
    const spaces = ' '.repeat(indent);
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        console.log(`${spaces}${key}:`);
        this.printObject(value, indent + 2);
      } else if (Array.isArray(value)) {
        console.log(`${spaces}${key}: [${value.length} items]`);
        if (value.length > 0 && value.length <= 5) {
          value.forEach((item, index) => {
            console.log(`${spaces}  ${index + 1}. ${item}`);
          });
        }
      } else {
        console.log(`${spaces}${key}: ${value}`);
      }
    }
  }

  startPhase(phase) {
    this.phases.set(phase, { start: Date.now() });
    this.log('▶️', 'green', 'FASE', `Iniciando: ${this.getPhaseName(phase)}`);
  }

  endPhase(phase) {
    const phaseData = this.phases.get(phase);
    if (phaseData) {
      const duration = Date.now() - phaseData.start;
      phaseData.duration = duration;
      this.log('✅', 'green', 'FASE', 
        `Completado: ${this.getPhaseName(phase)} - ${duration}ms`);
    }
  }

  getPhaseName(phase) {
    const phaseNames = {
      'manifest-load': 'Carga de manifiesto',
      'file-verification': 'Verificación de archivos',
      'libraries-processing': 'Procesamiento de librerías',
      'args-building': 'Construcción de argumentos',
      'game-launch': 'Lanzamiento del juego'
    };
    return phaseNames[phase] || phase;
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log(colors.bright + colors.magenta + '📊 INFORME DETALLADO DE EJECUCIÓN' + colors.reset);
    console.log('='.repeat(80));
    
    // Resumen general
    console.log(colors.bright + colors.cyan + '\n🎯 RESUMEN GENERAL:' + colors.reset);
    console.log(`   ⏱️  Tiempo total: ${totalTime}ms`);
    console.log(`   📚 Librerías procesadas: ${this.libraries.length}`);
    console.log(`   🔗 Archivos en classpath: ${this.classpathFiles.length}`);
    console.log(`   ⚠️  Advertencias: ${this.warnings.length}`);
    console.log(`   ❌ Errores: ${this.errors.length}`);
    
    // Tiempos por fase
    console.log(colors.bright + colors.cyan + '\n⏱️  TIEMPOS POR FASE:' + colors.reset);
    let totalPhaseTime = 0;
    this.phases.forEach((data, phase) => {
      if (data.duration) {
        console.log(`   ${this.getPhaseName(phase)}: ${data.duration}ms`);
        totalPhaseTime += data.duration;
      }
    });
    console.log(`   Otros procesos: ${totalTime - totalPhaseTime}ms`);
    
    // Librerías críticas
    console.log(colors.bright + colors.cyan + '\n📚 LIBRERÍAS CRÍTICAS:' + colors.reset);
    const criticalLibs = this.libraries.filter(lib => 
      lib.includes('lwjgl') || lib.includes('netty') || lib.includes('log4j') || lib.includes('guava')
    );
    criticalLibs.forEach(lib => {
      console.log(`   📦 ${lib}`);
    });
    
    // Output del juego
    if (this.gameOutput.length > 0) {
      console.log(colors.bright + colors.cyan + '\n🎮 OUTPUT DEL JUEGO:' + colors.reset);
      this.gameOutput.slice(-10).forEach(output => {
        console.log(`   ${output}`);
      });
    }
    
    // Errores y advertencias
    if (this.warnings.length > 0) {
      console.log(colors.bright + colors.yellow + '\n⚠️  ADVERTENCIAS:' + colors.reset);
      this.warnings.forEach(warning => {
        console.log(`   ${warning}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log(colors.bright + colors.red + '\n❌ ERRORES:' + colors.reset);
      this.errors.forEach(error => {
        console.log(`   ${error}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

async function startMinecraftGame() {
  const logger = new MinecraftLogger();
  
  try {
    console.log(colors.bright + colors.magenta + '\n🎮 INICIANDO MINECRAFT - CAPTURA COMPLETA DE DATOS' + colors.reset);
    console.log('='.repeat(60));
    
    const userAccount = await Mojang.login("Stepnicka012");
    logger.log('🔐', 'green', 'AUTENTICACIÓN', 
      `Usuario: ${userAccount.name} | UUID: ${userAccount.uuid}`);

    const { emitter } = await ArgumentsBuilder({
      gameRoot: ".minecraft",
      version: "1.21.10",
      java: 'java',
      // java: 'C:/Program Files/Java/jre1.8.0_471/bin/java.exe',
      memory: {
        max: "4G",
        min: "512M",
      },
      override: {
        // minecraftJar: '.minecraft/versions/1.7.10/1.7.10.jar',
        // libraryRoot: ".minecraft/libraries",
        // natives: ".minecraft/versions/1.7.10/natives",
        // gameDirectory:".minecraft",
        // versionJson:".minecraft/versions/1.7.10/1.7.10.json",
        // assetIndex:'1.7.10',
        // assetRoot:'.minecraft/assets',
      },
      window: {
        // width: 854,
        // height: 480,
        fullscreen: false,
      },
      enableDebug: true,
      enableSpeedMetrics: true,
      user: userAccount,
    });

    // 1. EVENTOS DE ESTADO Y PROGRESO
    emitter.on("status", (message) => {
      logger.log('📢', 'blue', 'ESTADO', message);
    });
    
    emitter.on("progress", (data) => {
      logger.log('📊', 'cyan', 'PROGRESO', 
        `${data.type} - ${data.message}`, data);
    });
    
    // 2. EVENTOS DE FASES
    emitter.on("phase-start", (phase) => {
      logger.startPhase(phase);
    });
    
    emitter.on("phase-end", (phase, time) => {
      logger.endPhase(phase);
    });
    
    // 3. EVENTOS DE MÉTRICAS
    emitter.on("speed", (data) => {
      logger.log('⏱️', 'yellow', 'MÉTRICA', 
        `${data.phase}: ${data.time}ms`, data);
    });
    
    // 4. EVENTOS DE DEBUG - INFORMACIÓN DETALLADA
    emitter.on("debug", (data) => {
      switch (data.type) {
        case "jvm-args":
          logger.log('⚙️', 'magenta', 'JVM', 
            `Argumentos JVM cargados: ${data.args?.length || 0}`, {
              'Memoria': data.memory,
              'Classpath': `${data.classpathCount} archivos`,
              'Nativas': data.nativesDir,
              'Proxy': data.proxy ? 'Configurado' : 'No'
            });
          break;
          
        case "game-args":
          logger.log('🎮', 'magenta', 'JUEGO', 
            `Argumentos de juego: ${data.args?.length || 0}`, {
              'Ventana': data.window,
              'Características': data.features,
              'Argumentos personalizados': data.MC_ARGS
            });
          break;
          
        case "classpath":
          logger.log('🔗', 'magenta', 'CLASSPATH', 
            `${data.count} archivos cargados`, {
              'Client JAR': data.clientJar,
              'Directorio nativas': data.nativesDir,
              'Assets': `${data.assetsRoot} (${data.assetsIndexName})`
            });
          // Guardar classpath para el reporte
          logger.classpathFiles = data.classpath || [];
          break;
          
        case "final-command":
          logger.log('🚀', 'green', 'LANZAMIENTO', 
            `Comando listo - ${data.totalArgs} argumentos`, {
              'Java': data.javaExec,
              'Clase principal': data.mainClass,
              'Argumentos JVM': data.JVM_ARGS?.length || 0,
              'Argumentos juego': data.MC_ARGS ? Object.keys(data.MC_ARGS).length : 0
            });
          break;
          
        case "arguments-display":
          logger.log('📋', 'cyan', 'CONFIGURACIÓN', 
            `Configuración lista`, {
              'Java': data.javaExecutable,
              'Clase principal': data.mainClass,
              'JVM Args': data.jvmArgs?.length || 0,
              'Game Args': data.gameArgs?.length || 0
            });
          break;
          
        default:
          logger.log('🔍', 'white', 'DEBUG', 
            `Tipo: ${data.type}`, data);
      }
    });

    // 5. EVENTOS DE INICIO
    emitter.on("launch-start", (data) => {
      logger.log('🚀', 'green', 'INICIO', 
        `Iniciando Minecraft...`, {
          'Java': data.javaExec,
          'Clase principal': data.mainClass,
          'Memoria': data.memory,
          'Resolución': data.window ? `${data.window.width}x${data.window.height}` : 'Default',
          'Proxy': data.proxy ? `${data.proxy.type}://${data.proxy.host}:${data.proxy.port}` : 'No'
        });
    });
    
    emitter.on("launch-complete", (data) => {
      logger.log('🎉', 'green', 'ÉXITO', 
        `Configuración completada correctamente`, {
          'PID': data.pid,
          'Tiempo total': `${data.totalTime}ms`,
          'Archivos cargados': data.classpathCount,
          'Librerías': data.libraryCount
        });
    });
    
    emitter.on("launch-failed", (data) => {
      logger.log('❌', 'red', 'FALLO', 
        `Error en el lanzamiento: ${data.error?.message}`, data.error);
      logger.errors.push(`Lanzamiento: ${data.error?.message}`);
    });
    
    // 6. EVENTOS DEL JUEGO
    emitter.on("game-started", (data) => {
      logger.log('🎮', 'green', 'JUEGO', 
        `¡Minecraft ejecutándose! PID: ${data.pid}`);
    });
    
    emitter.on("game-exit", (data) => {
      logger.log('🔚', 'yellow', 'JUEGO', 
        `Juego cerrado - Código: ${data.code} | Señal: ${data.signal}`, {
          'Tiempo jugado': `${data.totalTime}ms`
        });
    });
    
    emitter.on("game-error", (message) => {
      logger.log('💥', 'red', 'ERROR-JUEGO', message);
      logger.errors.push(`Juego: ${message}`);
    });
    
    // 7. EVENTOS DE SALIDA - CAPTURA COMPLETA
    emitter.on("stdout", (message) => {
      const trimmed = message.trim();
      if (trimmed) {
        // Filtrar logs muy verbosos pero mantener información importante
        if (!trimmed.includes('debug') && !trimmed.includes('DEBUG')) {
          logger.log('📤', 'white', 'STDOUT', trimmed);
          logger.gameOutput.push(trimmed);
          
          // Detectar eventos importantes del juego
          if (trimmed.includes('Loading') || trimmed.includes('Preparing')) {
            logger.log('🔄', 'cyan', 'CARGA', trimmed);
          }
          if (trimmed.includes('Connecting to')) {
            logger.log('🌐', 'blue', 'CONEXIÓN', trimmed);
          }
          if (trimmed.includes('Game crashed')) {
            logger.log('💥', 'red', 'CRASH', '¡EL JUEGO SE HA CERRADO INESPERADAMENTE!');
          }
        }
      }
    });
    
    emitter.on("stderr", (message) => {
      const trimmed = message.trim();
      if (trimmed) {
        // Clasificar el tipo de mensaje stderr
        if (trimmed.includes('ERROR') || trimmed.includes('Exception')) {
          logger.log('❌', 'red', 'STDERR-ERROR', trimmed);
          logger.errors.push(`STDERR: ${trimmed}`);
        } else if (trimmed.includes('WARN') || trimmed.includes('Warning')) {
          logger.log('⚠️', 'yellow', 'STDERR-WARN', trimmed);
          logger.warnings.push(`STDERR: ${trimmed}`);
        } else if (!trimmed.includes('Render') && !trimmed.includes('OpenGL') && 
                   !trimmed.includes('Datafixer') && !trimmed.includes('Failed to get system info')) {
          logger.log('📥', 'yellow', 'STDERR-INFO', trimmed);
          logger.systemOutput.push(trimmed);
        }
      }
    });
    
    emitter.on("exit", (data) => {
      logger.log('🚪', 'yellow', 'SALIDA', 
        `Proceso finalizado`, {
          'Código': data.code,
          'Señal': data.signal
        });
    });
    
    emitter.on("error", (error) => {
      logger.log('💀', 'red', 'ERROR-CRÍTICO', 
        `Error general: ${error.message}`, error.stack);
      logger.errors.push(`General: ${error.message}`);
    });
    
    // Capturar librerías procesadas
    emitter.on("libraries-processed", (data) => {
      logger.libraries = data.libraries || [];
      logger.log('📦', 'cyan', 'LIBRERÍAS', 
        `${data.count} librerías procesadas`, {
          'LWJGL encontradas': data.libraries.filter(lib => lib.includes('lwjgl')).length,
          'Nativas procesadas': data.natives || 0
        });
    });
    
    // Manejar cierre del proceso para generar reporte
    process.on('exit', () => {
      logger.generateReport();
    });
    
    process.on('SIGINT', () => {
      logger.log('🛑', 'yellow', 'SISTEMA', 'Cerrando por interrupción del usuario');
      logger.generateReport();
      process.exit(0);
    });
    
  } catch (error) {
    logger.log('💀', 'red', 'ERROR-INICIAL', 
      `No se pudo iniciar Minecraft: ${error.message}`, error.stack);
    logger.errors.push(`Inicial: ${error.message}`);
    logger.generateReport();
  }
}

// Iniciar el juego con captura completa
console.log(colors.bright + colors.magenta + '\n🎮 INICIANDO CAPTURA COMPLETA DE MINECRAFT' + colors.reset);
console.log(colors.cyan + '📝 Todos los eventos y datos serán registrados' + colors.reset);
console.log('='.repeat(60));

startMinecraftGame().catch(error => {
  console.error(colors.red + '❌ Error fatal:' + colors.reset, error.message);
  if (error.stack) {
    console.error(colors.red + 'Stack trace:' + colors.reset, error.stack);
  }
});