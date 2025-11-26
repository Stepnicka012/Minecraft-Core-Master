import { LibraryBuyer } from '../../dist/Minecraft/LibraryBuyer.js';

async function main() {
  // Crear instancia del downloader
  const manager = new LibraryBuyer({
    root: '.minecraft',                                // Carpeta raíz de Minecraft
    version: '1.7.10-Forge10.13.4.1614-1.7.10',       // Versión + Forge
    forceDownload: true,                               // Fuerza descarga aunque exista
    concurry: 6                                        // Descargas simultáneas
  });

  // Configurar eventos
  manager.on("Start", () => console.log("🔍 Iniciando verificación de librerías..."));
  manager.on("LibraryMissing", ({ library, url, filePath }) => 
      console.log(`❌ Faltante: ${library} -> ${filePath} (${url})`));
  manager.on("LibraryExists", ({ library, filePath }) => 
      console.log(`✅ Existente: ${library} -> ${filePath}`));
  manager.on("FileStart", ({ filePath, url }) => 
      console.log(`📥 Descargando: ${filePath} (${url})`));
  manager.on("FileSuccess", ({ filePath, size, url }) => 
      console.log(`✅ Descargado: ${filePath} (${size} bytes) -> ${url}`));
  manager.on("FileError", ({ filePath, error, url }) => 
      console.log(`❌ Error: ${filePath} -> ${error} (${url})`));
  manager.on("Complete", ({ success, failed, total }) => 
      console.log(`🎯 Completado: ${success} exitosas, ${failed} fallidas de ${total}`));

  // Ejecutar
  try {
    const allOk = await manager.ensureLibraries();
    console.log(allOk ? "🎉 Todas las librerías están listas!" : "⚠️ Algunas librerías fallaron");
  } catch (error) {
    console.error('💥 Error crítico:', error);
  }
}

// Arrancar
main();
