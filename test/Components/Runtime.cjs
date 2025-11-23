const { RuntimeDownloader } = require("../../dist/Minecraft/Runtime");
const downloader = new RuntimeDownloader({
  version:"1.21.10",
  root:".minecraft",
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
