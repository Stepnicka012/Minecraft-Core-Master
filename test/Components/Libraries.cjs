const { LibrariesDownloader } = require("../../dist/Minecraft/Libraries");
const downloader = new LibrariesDownloader({
  version:"1.12.2",
  root:".minecraft",
  concurry: 50,
  maxRetries: 30,
});

downloader.on("Start", () => console.log("✅ - Descarga iniciada"));
downloader.on("Bytes", (b) => console.log("⬇️ - Descargado:", b));
downloader.on("Done", () => console.log("✅ - Descarga finalizada"));
downloader.on("Paused", () => console.log("⏸️ - Pausado"));
downloader.on("Resumed", () => console.log("▶️ - Reanudado"));
downloader.on("Stopped", () => console.log("🛑 - Detenido"));

(async () => {
  const total = await downloader.getTotalBytes();
  console.log("Bytes a descargar", total);
  await downloader.start();
})();
