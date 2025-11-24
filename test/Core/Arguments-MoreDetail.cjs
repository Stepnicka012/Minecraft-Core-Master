const { Mojang } = require("../../dist/index");
const { ArgumentsBuilder } = require("../../dist/Minecraft/Arguments");

const colors = {
    reset: '\x1b[0m', bright: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m', 
    yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
    white: '\x1b[37m', gray: '\x1b[90m'
};

class UltimateMinecraftLogger {
  constructor() {
    this.startTime = Date.now();
    this.phases = new Map();
    this.libraries = [];
    this.classpathFiles = [];
    this.errors = [];
    this.warnings = [];
    this.gameOutput = [];
    this.systemOutput = [];
    this.debugData = new Map();
    this.eventCounts = new Map();
    this.performanceMetrics = [];
    this.customEvents = [];
    this.memoryUsage = [];
    this.networkActivity = [];
    this.fileOperations = [];
    this.processStats = [];
  }

  log(emoji, color, category, message, details = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${colors[color]}${emoji} [${timestamp}] ${category}: ${message}${colors.reset}`;
    console.log(logMessage);
    
    this.eventCounts.set(category, (this.eventCounts.get(category) || 0) + 1);
    
    if (details && Object.keys(details).length > 0) {
      console.log(colors.gray + '   └─ Detalles:' + colors.reset);
      this.printObject(details, 3);
    }
  }

  printObject(obj, indent = 0) {
    const spaces = ' '.repeat(indent);
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        console.log(`${spaces}${colors.cyan}${key}:${colors.reset}`);
        this.printObject(value, indent + 2);
      } else if (Array.isArray(value)) {
        console.log(`${spaces}${colors.cyan}${key}:${colors.reset} [${value.length} items]`);
        if (value.length > 0 && value.length <= 3) {
          value.forEach((item, index) => {
            console.log(`${spaces}  ${colors.gray}${index + 1}.${colors.reset} ${this.truncate(String(item), 80)}`);
          });
        }
      } else {
        const formattedValue = typeof value === 'boolean' ? 
          (value ? colors.green + 'true' + colors.reset : colors.red + 'false' + colors.reset) : 
          this.truncate(String(value), 100);
        console.log(`${spaces}${colors.cyan}${key}:${colors.reset} ${formattedValue}`);
      }
    }
  }

  truncate(str, length) {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  startPhase(phase) {
    this.phases.set(phase, { 
      start: Date.now(),
      name: this.getPhaseName(phase),
      events: []
    });
    this.log('▶️', 'green', 'FASE', `Iniciando: ${this.getPhaseName(phase)}`);
  }

  endPhase(phase, time = null) {
    const phaseData = this.phases.get(phase);
    if (phaseData) {
      const duration = time || (Date.now() - phaseData.start);
      phaseData.duration = duration;
      phaseData.end = Date.now();
      
      this.performanceMetrics.push({
        phase: phaseData.name,
        duration: duration,
        eventCount: phaseData.events.length,
        timestamp: new Date().toISOString()
      });
      
      this.log('✅', 'green', 'FASE', 
        `Completado: ${phaseData.name} - ${duration}ms (${phaseData.events.length} eventos)`);
    }
  }

  getPhaseName(phase) {
    const phaseNames = {
      'manifest-load': '📄 Carga de manifiesto',
      'file-verification': '🔍 Verificación de archivos',
      'libraries-processing': '📦 Procesamiento de librerías',
      'library-download': '⬇️  Descarga de librerías',
      'args-building': '⚙️  Construcción de argumentos',
      'game-launch': '🚀 Lanzamiento del juego'
    };
    return phaseNames[phase] || phase;
  }

  storeDebugData(type, data) {
    if (!this.debugData.has(type)) {
      this.debugData.set(type, []);
    }
    this.debugData.get(type).push({
      timestamp: new Date().toISOString(),
      data: data
    });
  }

  addCustomEvent(event) {
    this.customEvents.push({
      timestamp: new Date().toISOString(),
      ...event
    });
  }

  recordMemoryUsage() {
    const usage = process.memoryUsage();
    this.memoryUsage.push({
      timestamp: Date.now(),
      rss: Math.round(usage.rss / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024)
    });
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(100));
    console.log(colors.bright + colors.magenta + '📊 INFORME ULTIMATE DE EJECUCIÓN - CAPTURA COMPLETA' + colors.reset);
    console.log('='.repeat(100));
    
    // Resumen general
    console.log(colors.bright + colors.cyan + '\n🎯 RESUMEN GENERAL:' + colors.reset);
    console.log(`   ⏱️  Tiempo total: ${totalTime}ms`);
    console.log(`   📚 Librerías procesadas: ${this.libraries.length}`);
    console.log(`   🔗 Archivos en classpath: ${this.classpathFiles.length}`);
    console.log(`   ⚠️  Advertencias: ${this.warnings.length}`);
    console.log(`   ❌ Errores: ${this.errors.length}`);
    console.log(`   📈 Eventos capturados: ${Array.from(this.eventCounts.values()).reduce((a, b) => a + b, 0)}`);
    console.log(`   🎪 Eventos personalizados: ${this.customEvents.length}`);
    console.log(`   🔍 Datos debug: ${Array.from(this.debugData.values()).flat().length}`);
    
    // Estadísticas de eventos
    console.log(colors.bright + colors.cyan + '\n📈 ESTADÍSTICAS DE EVENTOS:' + colors.reset);
    const sortedEvents = Array.from(this.eventCounts.entries()).sort((a, b) => b[1] - a[1]);
    sortedEvents.forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
    
    // Tiempos por fase
    console.log(colors.bright + colors.cyan + '\n⏱️  ANÁLISIS DE PERFORMANCE:' + colors.reset);
    let totalPhaseTime = 0;
    this.phases.forEach((data, phase) => {
      if (data.duration) {
        const percentage = ((data.duration / totalTime) * 100).toFixed(1);
        console.log(`   ${data.name}: ${data.duration}ms (${percentage}%) - ${data.events.length} eventos`);
        totalPhaseTime += data.duration;
      }
    });
    
    // Datos de debug por tipo
    console.log(colors.bright + colors.cyan + '\n🔍 DATOS DE DEBUG CAPTURADOS:' + colors.reset);
    this.debugData.forEach((entries, type) => {
      console.log(`   ${type}: ${entries.length} entradas`);
    });
    
    // Resumen de librerías
    console.log(colors.bright + colors.cyan + '\n📚 RESUMEN DE LIBRERÍAS:' + colors.reset);
    const libTypes = {
      'lwjgl': this.libraries.filter(lib => lib.includes('lwjgl')).length,
      'netty': this.libraries.filter(lib => lib.includes('netty')).length,
      'log4j': this.libraries.filter(lib => lib.includes('log4j')).length,
      'guava': this.libraries.filter(lib => lib.includes('guava')).length,
      'forge': this.libraries.filter(lib => lib.includes('forge')).length,
      'fabric': this.libraries.filter(lib => lib.includes('fabric')).length
    };
    Object.entries(libTypes).forEach(([type, count]) => {
      if (count > 0) console.log(`   ${type}: ${count}`);
    });
    
    // Errores y advertencias
    if (this.warnings.length > 0) {
      console.log(colors.bright + colors.yellow + '\n⚠️  ULTIMAS ADVERTENCIAS:' + colors.reset);
      this.warnings.slice(-5).forEach((warning, index) => {
        console.log(`   ${index + 1}. ${this.truncate(warning, 120)}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log(colors.bright + colors.red + '\n❌ ULTIMOS ERRORES:' + colors.reset);
      this.errors.slice(-5).forEach((error, index) => {
        console.log(`   ${index + 1}. ${this.truncate(error, 120)}`);
      });
    }
    
    console.log('\n' + '='.repeat(100));
  }
}

async function startMinecraftGame() {
  const logger = new UltimateMinecraftLogger();
  
  try {
    console.log(colors.bright + colors.magenta + '\n🎮 INICIANDO MINECRAFT - CAPTURA ULTIMATE DE EVENTOS' + colors.reset);
    console.log(colors.cyan + '📝 Capturando ABSOLUTAMENTE TODOS los eventos y datos posibles' + colors.reset);
    console.log(colors.gray + '🔍 Nivel de detalle: MÁXIMO ABSOLUTO' + colors.reset);
    console.log('='.repeat(70));

    // Iniciar monitoreo de memoria
    const memoryInterval = setInterval(() => logger.recordMemoryUsage(), 1000);
    
    const userAccount = await Mojang.login("Stepnicka012");
    logger.log('🔐', 'green', 'AUTENTICACIÓN', 
      `Usuario autenticado: ${userAccount.name}`, {
        'UUID': userAccount.uuid,
        'Tipo de cuenta': userAccount.userType || 'mojang',
        'Token acceso': userAccount.accessToken ? '✓ Presente' : '✗ No disponible',
        'Timestamp': new Date().toISOString()
      });

    const { emitter, stats, pid, kill } = await ArgumentsBuilder({
      gameRoot: ".minecraft",
      version: "1.21.10",
      java: 'java',
      // java: 'runtime/java-21.0.7/bin/javaw.exe',
      // java: 'C:/Program Files/Java/jre1.8.0_471/bin/java.exe',
      memory: { max: "4G", min: "512M" },
      window: { width: 854, height: 480, fullscreen: false },
      enableDebug: true,
      enableSpeedMetrics: true,
      user: userAccount,
    });

    // ========== CAPTURA COMPLETA DE TODOS LOS EVENTOS ==========

    // 1. EVENTOS DE ESTADO Y PROGRESO
    emitter.on("status", (message) => {
      logger.log('📢', 'blue', 'ESTADO', message);
    });
    
    emitter.on("progress", (data) => {
      const emojiMap = {
        'loading': '🔄', 'preparing': '⚙️', 'downloading': '⬇️', 
        'downloaded': '✅', 'library-missing': '📦', 'extracting': '📁',
        'verifying': '🔍', 'processing': '⚡'
      };
      const emoji = emojiMap[data.type] || '📊';
      logger.log(emoji, 'cyan', 'PROGRESO', `${data.type} - ${data.message}`, data);
    });

    // 2. EVENTOS DE FASES
    emitter.on("phase-start", (phase) => {
      logger.startPhase(phase);
      const phaseData = logger.phases.get(phase);
      if (phaseData) phaseData.events.push({ type: 'start', timestamp: Date.now() });
    });
    
    emitter.on("phase-end", (phase, time) => {
      logger.endPhase(phase, time);
      const phaseData = logger.phases.get(phase);
      if (phaseData) phaseData.events.push({ type: 'end', timestamp: Date.now(), duration: time });
    });

    // 3. EVENTOS DE MÉTRICAS Y PERFORMANCE
    emitter.on("speed", (data) => {
      logger.log('⏱️', 'yellow', 'MÉTRICA', `${data.phase}: ${data.time}ms`, data);
      logger.performanceMetrics.push({...data, timestamp: Date.now()});
    });

    // 4. EVENTOS DE DEBUG - CAPTURA ABSOLUTAMENTE TODO
    emitter.on("debug", (data) => {
      logger.storeDebugData(data.type, data);
      
      const debugHandlers = {
        "jvm-args": () => logger.log('⚙️', 'magenta', 'DEBUG-JVM', 
          `JVM Args: ${data.args?.length || 0}`, {
            'Memoria': `${data.memory?.min} - ${data.memory?.max}`,
            'Classpath': `${data.classpathCount} archivos`,
            'Nativas': data.nativesDir ? basename(data.nativesDir) : 'N/A',
            'Proxy': data.proxy ? '✓ Configurado' : '✗ No',
            'Legacy': data.isLegacy ? '✓ Sí' : '✗ No',
            'Args Count': data.args?.length
          }),
        
        "game-args-debug": () => logger.log('🎮', 'magenta', 'DEBUG-GAME', 
          `Game Args: ${data.args?.length || 0}`, {
            'Directorio': data.gameDirectory,
            'Assets': `${basename(data.assetsRoot)} (${data.assetsIndexName})`,
            'Override': data.overrideGameDirectory ? '✓ Sí' : '✗ No'
          }),
        
        "classpath": () => {
          logger.log('🔗', 'magenta', 'DEBUG-CLASSPATH', 
            `${data.count} archivos en classpath`, {
              'Client JAR': data.clientJar ? basename(data.clientJar) : 'N/A',
              'Nativas': data.nativesDir ? basename(data.nativesDir) : 'N/A',
              'Assets Index': data.assetsIndexName,
              'Manifest Assets': data.manifestAssets,
              'Legacy': data.isLegacy ? '✓ Sí' : '✗ No'
            });
          logger.classpathFiles = data.classpath || [];
        },
        
        "final-command": () => logger.log('🚀', 'green', 'DEBUG-COMMAND', 
          `Comando final listo`, {
            'Java': data.javaExec,
            'Clase principal': data.mainClass,
            'Total argumentos': data.totalArgs,
            'JVM Args': data.JVM_ARGS?.length || 0,
            'MC Args': data.MC_ARGS ? Object.keys(data.MC_ARGS).length : 0,
            'Features': data.features ? Object.keys(data.features).length : 0
          }),
        
        "custom-version-detected": () => logger.log('🔧', 'yellow', 'DEBUG-CUSTOM', 
          `Versión custom detectada`, {
            'Forge': data.isForge ? '✓ Sí' : '✗ No',
            'Fabric': data.isFabric ? '✓ Sí' : '✗ No',
            'Clase principal': data.mainClass,
            'Versión': data.version
          }),
        
        "version-detection": () => logger.log('🔍', 'cyan', 'DEBUG-VERSION', 
          `Análisis de versión completado`, data),
          
        "library-processing": () => logger.log('📦', 'blue', 'DEBUG-LIBRARY', 
          `Procesando librerías`, data),
          
        "file-operation": () => logger.log('📁', 'white', 'DEBUG-FILE', 
          `Operación de archivo`, data),
          
        "network-request": () => logger.log('🌐', 'cyan', 'DEBUG-NETWORK', 
          `Solicitud de red`, data)
      };
      
      if (debugHandlers[data.type]) {
        debugHandlers[data.type]();
      } else {
        logger.log('🔍', 'white', 'DEBUG-GENERIC', `Tipo: ${data.type}`, data);
      }
    });

    // 5. EVENTOS DE INICIO Y CONFIGURACIÓN
    emitter.on("launch-start", (data) => {
      logger.log('🚀', 'green', 'LANZAMIENTO', 
        `Iniciando proceso de lanzamiento`, {
          'Java': data.javaExec,
          'Clase principal': data.mainClass,
          'Memoria': `${data.memory?.min} - ${data.memory?.max}`,
          'Ventana': data.window ? `${data.window.width}x${data.window.height}` : 'Default',
          'Proxy': data.proxy ? '✓ Configurado' : '✗ No',
          'Features': data.features ? Object.keys(data.features).length : 0,
          'Nativas': data.nativesDir ? basename(data.nativesDir) : 'N/A'
        });
    });
    
    emitter.on("launch-complete", (data) => {
      logger.log('🎉', 'green', 'ÉXITO', 
        `Configuración completada exitosamente`, {
          'PID': data.pid,
          'Tiempo total': `${data.totalTime}ms`,
          'Archivos classpath': data.classpathCount,
          'Librerías procesadas': data.libraryCount,
          'Proxy': data.proxy ? '✓ Configurado' : '✗ No',
          'Legacy': data.isLegacy ? '✓ Sí' : '✗ No',
          'Fases completadas': Object.keys(data.phaseTimes || {}).length
        });
    });
    
    emitter.on("launch-failed", (data) => {
      logger.log('❌', 'red', 'FALLO', 
        `Error en el lanzamiento`, {
          'Error': data.error?.message,
          'Tiempo transcurrido': `${data.totalTime}ms`,
          'Causa': data.error?.cause || 'Desconocida'
        });
      logger.errors.push(`Lanzamiento: ${data.error?.message}`);
    });

    // 6. EVENTOS DEL JUEGO EN TIEMPO REAL
    emitter.on("game-started", (data) => {
      logger.log('🎮', 'green', 'JUEGO-INICIADO', 
        `¡Minecraft ejecutándose!`, {
          'PID': data.pid,
          'Tiempo de carga': `${Date.now() - logger.startTime}ms`,
          'Timestamp': new Date().toISOString()
        });
    });
    
    emitter.on("game-exit", (data) => {
      logger.log('🔚', 'yellow', 'JUEGO-FINALIZADO', 
        `Juego cerrado`, {
          'Código salida': data.code ?? 'N/A',
          'Señal': data.signal ?? 'N/A',
          'Tiempo ejecución': `${data.totalTime}ms`,
          'Razón': data.code === 0 ? 'Normal' : 'Error'
        });
    });
    
    emitter.on("game-error", (message) => {
      logger.log('💥', 'red', 'ERROR-JUEGO', message);
      logger.errors.push(`Juego: ${message}`);
    });

    // 7. CAPTURA AVANZADA DE SALIDAS CON ANÁLISIS INTELIGENTE
    emitter.on("stdout", (message) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      
      logger.gameOutput.push(trimmed);
      
      // Análisis inteligente de logs del juego
      if (trimmed.includes('Loading') || trimmed.includes('Preparing')) {
        logger.log('🔄', 'blue', 'CARGA', trimmed);
      } else if (trimmed.includes('Connecting to') || trimmed.includes('Joining')) {
        logger.log('🌐', 'cyan', 'CONEXIÓN', trimmed);
      } else if (trimmed.includes('Sound engine started')) {
        logger.log('🔊', 'green', 'AUDIO', 'Motor de audio iniciado');
      } else if (trimmed.includes('OpenGL')) {
        logger.log('🎨', 'magenta', 'RENDER', trimmed);
      } else if (trimmed.includes('Game crashed')) {
        logger.log('💥', 'red', 'CRASH', '¡CRASH DETECTADO!', {log: trimmed});
      } else if (trimmed.includes('Done') || trimmed.includes('Success')) {
        logger.log('✅', 'green', 'ÉXITO', trimmed);
      } else if (!trimmed.includes('debug') && !trimmed.includes('DEBUG')) {
        logger.log('📤', 'white', 'STDOUT', trimmed);
      }
    });
    
    emitter.on("stderr", (message) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      
      logger.systemOutput.push(trimmed);
      
      // Análisis avanzado de errores
      if (trimmed.includes('ERROR') || trimmed.includes('Exception')) {
        const isCritical = trimmed.includes('Critical') || trimmed.includes('Fatal');
        logger.log(isCritical ? '💀' : '❌', 'red', 'STDERR-ERROR', trimmed);
        logger.errors.push(`STDERR: ${trimmed}`);
      } else if (trimmed.includes('WARN') || trimmed.includes('Warning')) {
        logger.log('⚠️', 'yellow', 'STDERR-WARN', trimmed);
        logger.warnings.push(`STDERR: ${trimmed}`);
      } else if (!trimmed.includes('Render') && !trimmed.includes('OpenGL') && 
                 !trimmed.includes('Datafixer') && !trimmed.includes('Failed to get system info')) {
        logger.log('📥', 'gray', 'STDERR-INFO', trimmed);
      }
    });

    // 8. EVENTOS DEL SISTEMA Y PROCESO
    emitter.on("exit", (data) => {
      logger.log('🚪', 'yellow', 'SALIDA', 
        `Proceso finalizado`, {
          'Código': data.code ?? 'N/A',
          'Señal': data.signal ?? 'N/A',
          'Tiempo total': `${Date.now() - logger.startTime}ms`
        });
      
    });
    
    emitter.on("error", (error) => {
      logger.log('💀', 'red', 'ERROR-CRÍTICO', 
        `Error general del sistema`, {
          'Mensaje': error.message,
          'Tipo': error.name,
          'Stack': error.stack ? 'Disponible' : 'No disponible'
        });
      logger.errors.push(`Sistema: ${error.message}`);
    });

    // 9. EVENTOS PERSONALIZADOS DEL LIBRARYBUYER Y MÁS
    const customEvents = {
      "LibraryMissing": (data) => logger.addCustomEvent({
        type: 'LIBRARY_MISSING', message: `Falta: ${data.library}`, data
      }),
      "FileStart": (data) => logger.addCustomEvent({
        type: 'DOWNLOAD_START', message: `Descargando: ${basename(data.filePath)}`, data
      }),
      "FileSuccess": (data) => logger.addCustomEvent({
        type: 'DOWNLOAD_SUCCESS', message: `Descargado: ${basename(data.filePath)}`, data
      }),
      "FileError": (data) => logger.addCustomEvent({
        type: 'DOWNLOAD_ERROR', message: `Error descarga: ${basename(data.filePath)}`, data
      }),
      "StartCheck": () => logger.addCustomEvent({
        type: 'CHECK_START', message: 'Iniciando verificación de librerías'
      }),
      "CheckComplete": (data) => logger.addCustomEvent({
        type: 'CHECK_COMPLETE', message: `Verificación completada`, data
      }),
      "StartDownload": () => logger.addCustomEvent({
        type: 'DOWNLOAD_START', message: 'Iniciando descarga de librerías'
      }),
      "DownloadComplete": (data) => logger.addCustomEvent({
        type: 'DOWNLOAD_COMPLETE', message: `Descarga completada`, data
      }),
      "Bytes": (data) => logger.addCustomEvent({
        type: 'BYTES_DOWNLOADED', message: `Bytes descargados: ${data}`
      })
    };

    Object.entries(customEvents).forEach(([event, handler]) => {
      emitter.on(event, handler);
    });

    // 10. CAPTURA DE ESTADÍSTICAS Y MÉTRICAS ADICIONALES
    if (stats) {
      logger.addCustomEvent({
        type: 'STATS_FINAL',
        message: 'Estadísticas finales del lanzamiento',
        data: stats
      });
    }

    // Manejo de cierre para reporte final
    const generateFinalReport = () => {
      clearInterval(memoryInterval);
      console.log('\n' + colors.bright + colors.yellow + '🛑 GENERANDO REPORTE FINAL ULTIMATE...' + colors.reset);
      logger.generateReport();
    };
    
    process.on('exit', generateFinalReport);
    process.on('SIGINT', () => {
      console.log('\n' + colors.yellow + '⚠️  Interrupción recibida, generando reporte ultimate...' + colors.reset);
      generateFinalReport();
      process.exit(0);
    });
    
    // Timer de seguridad para reporte automático
    setTimeout(() => {
      console.log(colors.gray + '\n⏰ Timer de reporte automático activado (30s)' + colors.reset);
    }, 30000);

    // Monitoreo continuo
    setInterval(() => {
      logger.recordMemoryUsage();
    }, 5000);
    
  } catch (error) {
    logger.log('💀', 'red', 'ERROR-INICIAL', 
      `Fallo catastrófico en la inicialización`, {
        'Mensaje': error.message,
        'Stack': error.stack,
        'Tipo': error.name,
        'Timestamp': new Date().toISOString()
      });
    logger.errors.push(`Inicialización: ${error.message}`);
    logger.generateReport();
    throw error;
  }
}

// EJECUCIÓN CON CAPTURA MÁXIMA
console.log(colors.bright + colors.magenta + '\n🎮 INICIANDO CAPTURA ULTIMATE DE MINECRAFT' + colors.reset);
console.log(colors.cyan + '📝 ABSOLUTAMENTE TODOS los eventos serán capturados y analizados' + colors.reset);
console.log(colors.gray + '🔍 Nivel de detalle: MÁXIMO ABSOLUTO - 100% DE COBERTURA' + colors.reset);
console.log('='.repeat(80));

startMinecraftGame().catch(error => {
  console.error(colors.red + '❌ Error catastrófico fuera del try-catch:' + colors.reset, error);
  if (error.stack) {
    console.error(colors.red + 'Stack trace completo:' + colors.reset, error.stack);
  }
});