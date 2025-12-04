// Uso en otro script
import FabricDownloader from '../../dist/ModLoaders/Fabric/Fabric.js';

(async () => {
  const downloader = new FabricDownloader({
    version: "1.14.2",
    root: ".minecraft",
    concurrency: 10,
    maxRetries: 15,
  });

  // Todos los eventos
  downloader.on("start", () => console.log("✅ - Descarga iniciada"));
  downloader.on("bytes", (bytes) => console.log("⬇️ - Descargado:", bytes, "bytes"));
  downloader.on("done", (result) => console.log("✅ - Descarga finalizada:", result));
  downloader.on("paused", () => console.log("⏸️ - Pausado"));
  downloader.on("resumed", () => console.log("▶️ - Reanudado"));
  downloader.on("stopped", () => console.log("🛑 - Detenido"));
  downloader.on("progress", (progress) => {
    console.log(`📊 Progreso: ${progress.downloaded}/${progress.total} bytes`);
  });
  downloader.on("fileStart", (file) => {
    console.log(`📁 Iniciando: ${file.name} (${file.type})`);
  });
  downloader.on("fileComplete", (file) => {
    console.log(`✅ Completado: ${file.name}`);
  });
  downloader.on("fileError", (error) => {
    console.error(`❌ Error en: ${error.name} - ${error.error}`);
  });
  downloader.on("error", (error) => {
    console.error(`💥 Error general: ${error.message}`);
  });

  // INICIAR
  await downloader.start();
  
  // Ejemplos de control:
  // setTimeout(() => downloader.pause(), 5000);
  // setTimeout(() => downloader.resume(), 10000);
  // setTimeout(() => downloader.stop(), 15000);
})();