const { LibraryManager } = require('../../dist/Minecraft/LegacyLibraries');

// Para Forge 1.7.10
const manager = new LibraryManager({
  root: '.minecraft',
  version: '1.7.10-Forge10.13.4.1614-1.7.10',
  forceDownload: false,
  concurry: 6
});

// Configurar eventos
manager.on("Start", () => console.log("🔍 Iniciando verificación de librerías..."));
manager.on("LibraryMissing", (data) => console.log(`❌ Faltante: ${data.library}`));
manager.on("LibraryExists", (data) => console.log(`✅ Existente: ${data.library}`));
manager.on("FileStart", (data) => console.log(`📥 Descargando: ${data.filePath}`));
manager.on("FileSuccess", (data) => console.log(`✅ Descargado: ${data.filePath} (${data.size} bytes)`));
manager.on("FileError", (data) => console.log(`❌ Error: ${data.filePath} - ${data.error}`));
manager.on("Complete", (result) => console.log(`🎯 Completado: ${result.success} exitosas, ${result.failed} fallidas`));

// Ejecutar
async function main() {
  try {
    const totalSize = await manager.getTotalDownloadSize();
    console.log(`📊 Tamaño total a descargar: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    const success = await manager.ensureLibraries();
    console.log(success ? "🎉 Todas las librerías están listas!" : "⚠️ Algunas librerías fallaron");
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

main();