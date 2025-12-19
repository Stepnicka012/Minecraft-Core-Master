const { NativesDownloader } = require("../../dist/Minecraft/Natives");
const downloader = new NativesDownloader({
  version:"1.12.2",
  root:"minecraft",
  installBaseRoot: true,
  concurry: 50,
  maxRetries: 30,
  // internal:{
  //   flattenNatives: true,
  //   validExts: ['.so'],
  //   cleanAfter: true,
  //   ignoreFolders: ['META-INF'],
  // }
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