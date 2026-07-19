const { startScrapeWorker, stopScrapeWorker } = require('./scrapeWorker');
const { startPdfWorker, stopPdfWorker } = require('./pdfWorker');

function startWorkers() {
  startScrapeWorker();
  startPdfWorker();
}

async function stopWorkers() {
  await Promise.allSettled([
    stopScrapeWorker(),
    stopPdfWorker(),
  ]);
}

module.exports = { startWorkers, stopWorkers };
