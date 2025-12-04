const { ServerDownloader } = require("../../dist/Index.js");

(async()=>{

  const downloader = new ServerDownloader({
    version: "1.12.2",
    root: ".minecraft",
  });

  downloader.on("Progress", (progress) => {
    console.log(`Progreso: ${progress.percentage.toFixed(2)}%`);
  });

  await downloader.start();
})();
