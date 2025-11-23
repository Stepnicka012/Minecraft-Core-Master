const { Mojang } = require("../../dist/index");
const { launchMinecraft } = require("../../dist/Minecraft/Arguments");

async function startMinecraftGame() {
  const userAccount = await Mojang.login("Stepnicka012");

  try {
    const { emitter, stats } = await launchMinecraft({
      gameRoot: ".minecraft",
      version: "1.12.2",
      java:'java',
      // java: "C:/Program Files/Java/jre1.8.0_471/bin/javaw.exe",
      memory: {
        max: "4G",
        min: "512M",
      },
      override:{
        // minecraftJar: '.minecraft/versions/quilt-loader-0.29.2-1.21.10/quilt-loader-0.29.2-1.21.10.jar',
        // libraryRoot:".minecraft/libraries",
        // natives:".minecraft/versions/1.12.2/natives"
      },
      window: {
        // width: 854,
        // height: 480,
        fullscreen: false,
      },
      // features: {
      //   is_demo_user: false,
      //   has_custom_resolution: true,
      //   has_quick_plays_support: true
      // },
      user: userAccount,
    });
      
    // 1. EVENTOS DE ESTADO Y PROGRESO
    emitter.on("status", (message) => {
      console.log("📢 Estado:", message);
    });
    
    emitter.on("progress", (data) => {
      console.log("📊 Progreso:", data.type, "-", data.message);
    });
    
    // 2. EVENTOS DE FASES
    emitter.on("phase-start", (phase) => {
      console.log("▶️  Fase iniciada:", phase);
    });
    
    emitter.on("phase-end", (phase, time) => {
      console.log(`✅ Fase "${phase}" completada en ${time}ms`);
    });
    
    // 3. EVENTOS DE MÉTRICAS
    emitter.on("speed", (data) => {
      console.log(`⏱️  Velocidad - ${data.phase}: ${data.time}ms`);
    });
    
    // 4. EVENTOS DE INFORMACIÓN (menos técnicos)
    emitter.on("debug", (data) => {
      console.log("🔍 Información del sistema:");
      console.log("   Tipo:", data.type);
      
      switch (data.type) {
        case "arguments-display":
          console.log("   📋 Configuración lista:");
          console.log("      Java:", data.javaExecutable);
          console.log("      Clase principal:", data.mainClass);
          break;
          
        case "jvm-args":
          console.log("   ⚙️  Configuración de memoria:");
          console.log("      Memoria:", data.memory);
          break;
          
        case "game-args":
          console.log("   🎮 Configuración de juego:");
          console.log("      Resolución:", data.resolution);
          break;
          
        case "classpath":
          console.log("   🔗 Archivos cargados:");
          console.log("      Total:", data.count);
          break;
          
        case "final-command":
          console.log("   🚀 Comando listo para ejecutar");
          break;
          
        default:
          console.log("   Información:", data);
      }
      console.log("---");
    });

    // 5. EVENTOS DE INICIO
    emitter.on("launch-start", (data) => {
      console.log("🚀 Iniciando Minecraft...");
      console.log("   Java:", data.javaExec);
      console.log("   Resolución:", data.window?.width + "x" + data.window?.height);
    });
    
    emitter.on("launch-complete", (data) => {
      console.log("🎉 ¡Configuración completada!");
      console.log("   Tiempo total:", data.totalTime + "ms");
      console.log("   Archivos cargados:", data.classpathCount);
    });
    
    emitter.on("launch-failed", (data) => {
      console.error("❌ Error al iniciar:");
      console.error("   Problema:", data.error);
    });
    
    // 6. EVENTOS DEL JUEGO
    emitter.on("game-started", (data) => {
      console.log("🎮 ¡Minecraft se está ejecutando!");
      console.log("   ID del proceso:", data.pid);
    });
    
    emitter.on("game-exit", (data) => {
      console.log("🔚 Minecraft se cerró");
      console.log("   Código de salida:", data.code);
      console.log("   Tiempo jugado:", data.totalTime + "ms");
    });
    
    emitter.on("game-error", (message) => {
      console.error("💥 Error en el juego:");
      console.error("   Mensaje:", message);
    });
    
    // 7. EVENTOS DE SALIDA
    emitter.on("stdout", (message) => {
      const trimmed = message.trim();
      if (trimmed && !trimmed.includes("debug") && !trimmed.includes("DEBUG")) {
        console.log("📤 Juego:", trimmed);
      }
    });
    
    emitter.on("stderr", (message) => {
      const trimmed = message.trim();
      if (trimmed && !trimmed.includes("Render") && !trimmed.includes("OpenGL")) {
        console.log("📥 Sistema:", trimmed);
      }
    });
    
    emitter.on("exit", (data) => {
      console.log("🚪 Proceso finalizado");
      console.log("   Código:", data.code);
    });
    
    emitter.on("error", (error) => {
      console.error("❌ Error general:");
      console.error("   Descripción:", error.message);
    });
    
    // ESTADÍSTICAS FINALES AMIGABLES
    process.on('exit', () => {
      console.log("" + "=".repeat(50));
      console.log("📊 RESUMEN DE LA EJECUCIÓN");
      console.log("=".repeat(50));
      console.log("⏱️  Tiempo total:", stats.totalTime + "ms");
      console.log("📚 Librerías usadas:", stats.libraryCount);
      console.log("🔗 Archivos cargados:", stats.classpathCount);
      console.log("🔄 Tiempos por etapa:");
      Object.entries(stats.phaseTimes).forEach(([phase, time]) => {
        const phaseName = phase === "manifest-load" ? "Cargar información" :
                         phase === "file-verification" ? "Verificar archivos" :
                         phase === "libraries-processing" ? "Procesar librerías" :
                         phase === "args-building" ? "Preparar configuración" :
                         phase === "game-launch" ? "Iniciar juego" : phase;
        console.log(`   ${phaseName}: ${time}ms`);
      });
      console.log("=".repeat(50));
    });
    
  } catch (error) {
    console.error("❌ No se pudo iniciar Minecraft:");
    console.error("   Problema:", error.message);
    if (error.stack) {
      console.error("   Detalles técnicos:", error.stack);
    }
  }
}

// Iniciar el juego de manera segura
console.log("🎮 Preparando Minecraft...");
startMinecraftGame().catch(error => {
  console.error("❌ Error al iniciar el juego:", error.message);
});