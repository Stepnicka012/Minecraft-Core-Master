const { MinecraftDownloader } = require('../../dist/Components/Download');

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

// ETA
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
        startOnFinish: false,
        sections:{
            Client:{
                concurry: 5,
                maxRetries: 10,
                decodeJson: false,
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
