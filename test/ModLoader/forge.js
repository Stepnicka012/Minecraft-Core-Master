// Uso en otro script
import {ForgeDownloader} from '../../dist/ModLoaders/Forge/Forge.js';

(async () => {
  const downloader = new ForgeDownloader({
    version: "1.14.4-28.2.27",
    root: ".minecraft",
    concurrency: 10,
    maxRetries: 15,
    verbose: true
  });

  // Todos los eventos disponibles
  downloader.on("start", () => console.log("✅ - Descarga iniciada"));
  downloader.on("bytes", (bytes) => console.log("⬇️ - Descargado:", bytes, "bytes"));
  downloader.on("done", (result) => console.log("✅ - Descarga finalizada:", result));
  downloader.on("paused", () => console.log("⏸️ - Pausado"));
  downloader.on("resumed", () => console.log("▶️ - Reanudado"));
  downloader.on("stopped", () => console.log("🛑 - Detenido"));
  downloader.on("progress", (progress) => {
    console.log(`📊 Progreso: ${progress.downloaded}/${progress.total} bytes (${progress.percentage.toFixed(1)}%)`);
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
  downloader.on("javaCheck", (version) => {
    console.log(`☕ Java detectado: ${version}`);
  });
  downloader.on("downloading", (url) => {
    console.log(`🔗 Descargando desde: ${url}`);
  });
  downloader.on("installing", () => {
    console.log(`🔧 Instalando Forge...`);
  });
  downloader.on("cleanup", (files) => {
    console.log(`🧹 Limpiando ${files.length} archivos`);
  });

  try {
    // INICIAR
    await downloader.start();
    
    // Ejemplos de control:
    // setTimeout(() => downloader.pause(), 5000);
    // setTimeout(() => downloader.resume(), 10000);
    // setTimeout(() => downloader.stop(), 15000);
    
  } catch (error) {
    console.error('Error en el proceso:', error);
  }
})();