const PDFJob = require('../models/PDFJob');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const { encryptPDF } = require('@pdfsmaller/pdf-encrypt-lite');
const logger = require('../utils/logger');
const zlib = require('zlib');

const TEMP_DIR = path.join(__dirname, '../temp');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

let _pdfjsLib = null;
async function getPdfjsLib() {
  if (!_pdfjsLib) {
    _pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  }
  return _pdfjsLib;
}

async function parsePdfData(dataBuffer) {
  const pdfjsLib = await getPdfjsLib();
  const data = new Uint8Array(dataBuffer.buffer || dataBuffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const numPages = doc.numPages;
  const metadata = await doc.getMetadata();

  let text = '';
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }

  return {
    text,
    numpages: numPages,
    info: metadata.info || {},
    metadata,
  };
}

function toNum(val, fallback) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  }
  return fallback;
}

class PDFService {
  async extractText(userId, file, options = {}) {
    try {
      logger.info('Starting PDF text extraction');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'extract-text', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);
      const dataBuffer = await fs.readFile(file.path);
      const data = await parsePdfData(dataBuffer);
      await this.updateProgress(pdfJob._id, 80);

      const results = { text: data.text, pageCount: data.numpages, info: data.info, metadata: data.metadata };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error extracting text from PDF:', error);
      throw error;
    }
  }

  async extractImages(userId, file, options = {}) {
    try {
      logger.info('Starting PDF image extraction');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'extract-images', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);
      const results = await this.extractImagesFromPDF(file.path, options, pdfJob._id);
      await this.updateProgress(pdfJob._id, 80);
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error extracting images from PDF:', error);
      throw error;
    }
  }

  async extractMetadata(userId, file, options = {}) {
    try {
      logger.info('Starting PDF metadata extraction');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'extract-metadata', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);
      const dataBuffer = await fs.readFile(file.path);
      const data = await parsePdfData(dataBuffer);
      await this.updateProgress(pdfJob._id, 80);

      const results = { metadata: this._parseMetadata(data), pageCount: data.numpages, info: options.includeRaw ? data.info : undefined };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error extracting metadata from PDF:', error);
      throw error;
    }
  }

  async convertToDocx(userId, file, options = {}) {
    try {
      logger.info('Starting PDF to DOCX conversion');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'convert-to-docx', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);
      const results = await this.convertPDFToDocx(file, options, pdfJob._id);
      await this.updateProgress(pdfJob._id, 80);
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error converting PDF to DOCX:', error);
      throw error;
    }
  }

  async convertToTxt(userId, file, options = {}) {
    try {
      logger.info('Starting PDF to TXT conversion');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'convert-to-txt', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);
      const dataBuffer = await fs.readFile(file.path);
      const data = await parsePdfData(dataBuffer);
      await this.updateProgress(pdfJob._id, 70);

      let text = data.text;
      if (options.preserveLineBreaks !== false) text = text.replace(/\r\n/g, '\n');

      const results = { text, pageCount: data.numpages, encoding: options.encoding || 'utf8', outputFile: await this.saveTextFile(text, file.originalname, options.encoding) };
      await this.updateProgress(pdfJob._id, 90);
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error converting PDF to TXT:', error);
      throw error;
    }
  }

  async modifyText(userId, file, options = {}) {
    try {
      logger.info('Starting PDF text modification');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'modify-text', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);
      const dataBuffer = await fs.readFile(file.path);
      const originalDoc = await PDFDocument.load(dataBuffer);
      await this.updateProgress(pdfJob._id, 50);

      const pdfjsLib = await getPdfjsLib();
      const data = new Uint8Array(dataBuffer.buffer || dataBuffer);
      const doc = await pdfjsLib.getDocument({ data }).promise;
      const metadata = await doc.getMetadata();
      const info = metadata.info || {};

      let allText = '';
      const pageTexts = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        pageTexts.push(pageText);
        allText += pageText + '\n';
      }

      let modifiedText = allText;
      if (options.operation === 'replace' && options.searchText) {
        modifiedText = modifiedText.split(options.searchText).join(options.replaceText || '');
      } else if (options.operation === 'append') {
        modifiedText = modifiedText + '\n' + (options.replaceText || '');
      } else if (options.operation === 'prepend') {
        modifiedText = (options.replaceText || '') + '\n' + modifiedText;
      } else if (options.operation === 'remove' && options.searchText) {
        modifiedText = modifiedText.split(options.searchText).join('');
      }

      await this.updateProgress(pdfJob._id, 70);

      const newDoc = await PDFDocument.create();
      const helveticaFont = await newDoc.embedFont(StandardFonts.Helvetica);
      const lines = modifiedText.split('\n');
      const PAGE_WIDTH = 612;
      const PAGE_HEIGHT = 792;
      const MARGIN = 50;
      const FONT_SIZE = 11;
      const LINE_HEIGHT = FONT_SIZE * 1.4;
      const MAX_LINES_PER_PAGE = Math.floor((PAGE_HEIGHT - 2 * MARGIN) / LINE_HEIGHT);

      let pageNum = 0;
      for (let i = 0; i < lines.length; i += MAX_LINES_PER_PAGE) {
        const pageLines = lines.slice(i, i + MAX_LINES_PER_PAGE);
        const page = newDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

        for (let li = 0; li < pageLines.length; li++) {
          const line = pageLines[li];
          const y = PAGE_HEIGHT - MARGIN - (li + 1) * LINE_HEIGHT;

          let truncatedLine = line;
          while (helveticaFont.widthOfTextAtSize(truncatedLine, FONT_SIZE) > (PAGE_WIDTH - 2 * MARGIN) && truncatedLine.length > 0) {
            truncatedLine = truncatedLine.slice(0, -1);
          }

          page.drawText(truncatedLine, {
            x: MARGIN,
            y,
            size: FONT_SIZE,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
        pageNum++;
      }

      if (newDoc.getPageCount() === 0) {
        const page = newDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        page.drawText(modifiedText || '(empty)', {
          x: MARGIN,
          y: PAGE_HEIGHT - MARGIN - FONT_SIZE,
          size: FONT_SIZE,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }

      if (info.Title) newDoc.setTitle(info.Title);
      if (info.Author) newDoc.setAuthor(info.Author);
      if (info.Subject) newDoc.setSubject(info.Subject);
      if (info.Creator) newDoc.setCreator(info.Creator);

      const pdfBytes = await newDoc.save();
      const outputFilename = `modified_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, pdfBytes);
      const stats = await fs.stat(outputPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = {
        operation: options.operation,
        pageCount: newDoc.getPageCount(),
        modified: true,
        originalText: allText.substring(0, 500),
        modifiedText: modifiedText.substring(0, 500),
        outputFile: { filename: `modified_${file.originalname}`, path: outputPath, size: stats.size },
      };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error modifying PDF text:', error);
      throw error;
    }
  }

  async addWatermark(userId, file, options = {}) {
    try {
      logger.info('Starting PDF watermark addition');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'add-watermark', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const watermarkText = options.watermarkText || 'CONFIDENTIAL';
      const opacity = toNum(options.opacity, 0.3);
      const fontSize = toNum(options.fontSize, 48);
      const rotation = toNum(options.rotation, -45);

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0.3, 0.3, 0.3),
          opacity,
          rotate: degrees(rotation),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const outputFilename = `watermarked_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, pdfBytes);
      const stats = await fs.stat(outputPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = { watermarkText, opacity, rotation, pageCount: pdfDoc.getPageCount(), outputFile: { filename: `watermarked_${file.originalname}`, path: outputPath, size: stats.size } };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error adding watermark:', error);
      throw error;
    }
  }

  async addSecurity(userId, file, options = {}) {
    try {
      logger.info('Starting PDF security addition');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'add-security', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const password = options.password || 'default123';

      const encryptedBytes = await encryptPDF(dataBuffer, { password });
      const outputFilename = `secured_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, Buffer.from(encryptedBytes));
      const stats = await fs.stat(outputPath);

      const pdfDoc = await PDFDocument.load(dataBuffer);

      await this.updateProgress(pdfJob._id, 90);

      const results = { passwordProtected: true, pageCount: pdfDoc.getPageCount(), outputFile: { filename: `secured_${file.originalname}`, path: outputPath, size: stats.size } };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error adding security:', error);
      throw error;
    }
  }

  async splitPdf(userId, file, options = {}) {
    try {
      logger.info('Starting PDF split');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'split-pdf', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const pageCount = pdfDoc.getPageCount();
      const pages = [];
      let totalSize = 0;

      let indices;
      if (options.mode === 'range' && options.pages) {
        const [start, end] = options.pages.split('-').map(Number);
        indices = Array.from({ length: (end || start) - start + 1 }, (_, i) => start + i - 1).filter(i => i >= 0 && i < pageCount);
      } else if (options.mode === 'pages' && options.pages) {
        indices = options.pages.split(',').map(Number).map(n => n - 1).filter(i => i >= 0 && i < pageCount);
      } else {
        indices = Array.from({ length: pageCount }, (_, i) => i);
      }

      const JSZip = require('jszip');
      const zip = new JSZip();

      for (const idx of indices) {
        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(pdfDoc, [idx]);
        newDoc.addPage(copiedPage);
        const pageBytes = await newDoc.save();
        const pageFilename = `page_${idx + 1}.pdf`;
        zip.file(pageFilename, pageBytes);
        totalSize += pageBytes.length;
        pages.push({ page: idx + 1, filename: pageFilename, size: pageBytes.length });
      }

      const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      const zipFilename = `split_${path.parse(file.originalname).name}.zip`;
      const zipPath = path.join(TEMP_DIR, zipFilename);
      await fs.writeFile(zipPath, zipBytes);
      const zipStats = await fs.stat(zipPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = {
        pageCount,
        pages,
        splitMode: options.mode,
        outputFile: { filename: zipFilename, path: zipPath, size: zipStats.size },
      };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error splitting PDF:', error);
      throw error;
    }
  }

  async mergePdf(userId, files, options = {}) {
    try {
      logger.info('Starting PDF merge');
      await ensureDir(TEMP_DIR);

      let orderedFiles = options.fileOrder
        ? options.fileOrder.map((name) => files.find((f) => f.filename === name)).filter(Boolean)
        : files;
      if (orderedFiles.length === 0) orderedFiles = files;
      const totalSize = orderedFiles.reduce((s, f) => s + (f.size || 0), 0);

      const pdfJob = await PDFJob.create({
        userId, filename: `merged-${Date.now()}.pdf`, originalName: `merged-${Date.now()}.pdf`,
        filePath: orderedFiles[0]?.path || '', fileSize: totalSize, mimeType: 'application/pdf',
        operation: 'merge-pdf', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const mergedDoc = await PDFDocument.create();
      let totalPages = 0;

      for (const f of orderedFiles) {
        try {
          const buf = await fs.readFile(f.path);
          const srcDoc = await PDFDocument.load(buf);
          const pageIndices = srcDoc.getPageIndices();
          const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
          for (const page of copiedPages) mergedDoc.addPage(page);
          totalPages += pageIndices.length;
        } catch {
          totalPages += 1;
        }
      }

      await this.updateProgress(pdfJob._id, 70);

      const mergedBytes = await mergedDoc.save();
      const mergedFilename = `merged_${Date.now()}.pdf`;
      const mergedPath = path.join(TEMP_DIR, mergedFilename);
      await fs.writeFile(mergedPath, mergedBytes);
      const stats = await fs.stat(mergedPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = { fileCount: orderedFiles.length, totalPages, outputFile: { filename: mergedFilename, path: mergedPath, size: stats.size } };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error merging PDFs:', error);
      throw error;
    }
  }

  async rotatePages(userId, file, options = {}) {
    try {
      logger.info('Starting PDF page rotation');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'rotate-pages', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const pages = pdfDoc.getPages();
      const rotation = toNum(options.rotation, 90);

      for (const page of pages) {
        page.setRotation(degrees(page.getRotation().angle + rotation));
      }

      const pdfBytes = await pdfDoc.save();
      const outputFilename = `rotated_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, pdfBytes);
      const stats = await fs.stat(outputPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = { rotation, pageCount: pdfDoc.getPageCount(), outputFile: { filename: `rotated_${file.originalname}`, path: outputPath, size: stats.size } };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error rotating pages:', error);
      throw error;
    }
  }

  async cropPages(userId, file, options = {}) {
    try {
      logger.info('Starting PDF page cropping');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId, filename: file.filename, originalName: file.originalname,
        filePath: file.path, fileSize: file.size, mimeType: file.mimetype,
        operation: 'crop-pages', options, status: 'processing', startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const pages = pdfDoc.getPages();
      const cropTop = toNum(options.top, 0);
      const cropBottom = toNum(options.bottom, 0);
      const cropLeft = toNum(options.left, 0);
      const cropRight = toNum(options.right, 0);
      const unit = options.unit || 'pt';

      for (const page of pages) {
        const { width, height } = page.getSize();

        let t = cropTop, b = cropBottom, l = cropLeft, r = cropRight;
        if (unit === 'mm') { t *= 2.835; b *= 2.835; l *= 2.835; r *= 2.835; }
        else if (unit === 'in') { t *= 72; b *= 72; l *= 72; r *= 72; }

        const newWidth = Math.max(1, width - l - r);
        const newHeight = Math.max(1, height - t - b);

        page.setCropBox(l, b, newWidth, newHeight);
        page.setMediaBox(l, b, newWidth, newHeight);
      }

      const pdfBytes = await pdfDoc.save();
      const outputFilename = `cropped_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, pdfBytes);
      const stats = await fs.stat(outputPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = { cropArea: { top: cropTop, right: cropRight, bottom: cropBottom, left: cropLeft, unit }, pageCount: pdfDoc.getPageCount(), outputFile: { filename: `cropped_${file.originalname}`, path: outputPath, size: stats.size } };
      await pdfJob.completeJob(results);
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error cropping pages:', error);
      throw error;
    }
  }

  async extractImagesFromPDF(filePath, options, jobId) {
    try {
      await ensureDir(TEMP_DIR);
      const pdfjsLib = await getPdfjsLib();
      const data = new Uint8Array((await fs.readFile(filePath)).buffer);
      const doc = await pdfjsLib.getDocument({ data }).promise;
      await this.updateProgress(jobId || null, 50);

      const extractedImages = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const ops = await page.getOperatorList();
        const imgs = [];
        const seen = new Set();

        for (let j = 0; j < ops.fnArray.length; j++) {
          if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
            const name = ops.argsArray[j][0];
            if (!seen.has(name)) {
              seen.add(name);
              try {
                const obj = await page.objs.get(name);
                if (obj && obj.data) {
                  const width = obj.width || obj.data.width;
                  const height = obj.height || obj.data.height;
                  if (!width || !height) continue;

                  let rawPixels = obj.data.rgbData || obj.data.data;
                  if (!rawPixels) continue;

                  if (rawPixels.constructor && rawPixels.constructor.name === 'Object') {
                    rawPixels = rawPixels.rgbData || rawPixels.data;
                    if (!rawPixels) continue;
                  }

                  const expectedLen = width * height * (rawPixels.length === width * height * 4 ? 4 : 3);
                  if (rawPixels.length < expectedLen) continue;

                  const imgFilename = `page_${i}_img_${imgs.length + 1}.png`;
                  const imgPath = path.join(TEMP_DIR, imgFilename);

                  const pngBuffer = this.createPNGFromPixels(
                    Buffer.from(rawPixels.buffer ? rawPixels.buffer : rawPixels),
                    width,
                    height
                  );
                  if (!pngBuffer) continue;
                  await fs.writeFile(imgPath, pngBuffer);
                  imgs.push({ filename: imgFilename, path: imgPath, size: pngBuffer.length, page: i, width, height });
                }
              } catch (err) { logger.error(`Error extracting image ${name} from page ${i}:`, err.message); }
            }
          }
        }

        extractedImages.push(...imgs);
        if (imgs.length === 0) {
          const infoFilename = `page_${i}_info.json`;
          const infoPath = path.join(TEMP_DIR, infoFilename);
          const info = JSON.stringify({ page: i, note: 'No embedded images found on this page' });
          await fs.writeFile(infoPath, info);
          extractedImages.push({ filename: infoFilename, path: infoPath, size: Buffer.byteLength(info), page: i });
        }
      }

      if (jobId) await this.updateProgress(jobId, 70);

      const format = options.format || 'png';

      const JSZip = require('jszip');
      const zip = new JSZip();
      const actualImages = extractedImages.filter((img) => !img.filename.endsWith('.json'));
      let zipEntryCount = 0;
      for (const img of actualImages) {
        try {
          const fileData = await fs.readFile(img.path);
          if (fileData && fileData.length > 8) {
            const isPng = fileData[0] === 137 && fileData[1] === 80 && fileData[2] === 78 && fileData[3] === 71;
            if (isPng) {
              zip.file(img.filename, fileData);
              zipEntryCount++;
            }
          }
        } catch (err) { logger.error(`Error reading ${img.filename} for ZIP:`, err.message); }
      }
      logger.info(`ZIP: added ${zipEntryCount} valid PNG files out of ${actualImages.length} extracted images`);
      const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      const zipFilename = `images_${jobId || Date.now()}.zip`;
      const zipPath = path.join(TEMP_DIR, zipFilename);
      await fs.writeFile(zipPath, zipBytes);
      const zipStats = await fs.stat(zipPath);

      if (jobId) await this.updateProgress(jobId, 90);

      return { images: extractedImages, count: extractedImages.length, format, quality: toNum(options.imageQuality, 300), outputFile: { filename: zipFilename, path: zipPath, size: zipStats.size } };
    } catch (error) {
      logger.error('Error extracting images from PDF:', error);
      throw new Error('Failed to extract images from PDF.');
    }
  }

  createPNGFromPixels(rawPixels, width, height) {
    const totalPixels = width * height;
    const channels = rawPixels.length >= totalPixels * 4 ? 4 : 3;
    const hasAlpha = channels === 4;
    const colorType = hasAlpha ? 6 : 2;

    const filtered = Buffer.alloc(height * (1 + width * channels));
    let offset = 0;
    for (let y = 0; y < height; y++) {
      filtered[offset++] = 0;
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * channels;
        for (let c = 0; c < channels; c++) {
          filtered[offset++] = rawPixels[srcIdx + c] || 0;
        }
      }
    }

    const compressed = zlib.deflateSync(filtered);

    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;
    ihdrData[9] = colorType;
    ihdrData[10] = 0;
    ihdrData[11] = 0;
    ihdrData[12] = 0;
    const ihdrChunk = this.makePNGChunk('IHDR', ihdrData);

    const idatChunk = this.makePNGChunk('IDAT', compressed);

    const iendChunk = this.makePNGChunk('IEND', Buffer.alloc(0));

    const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
    const validSignature = png[0] === 137 && png[1] === 80 && png[2] === 78 && png[3] === 71;
    return validSignature ? png : null;
  }

  makePNGChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = this.crc32(crcData);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
  }

  crc32(buf) {
    let table = PDFService._crcTable;
    if (!table) {
      table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        table[i] = c;
      }
      PDFService._crcTable = table;
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  async convertPDFToDocx(file, options, jobId) {
    try {
      const { Document, Packer, Paragraph, TextRun } = require('docx');
      await ensureDir(TEMP_DIR);

      if (jobId) await this.updateProgress(jobId, 50);

      const dataBuffer = await fs.readFile(file.path);
      const data = await parsePdfData(dataBuffer);

      if (jobId) await this.updateProgress(jobId, 70);

      const doc = new Document({
        sections: [{
          properties: {},
          children: data.text.split('\n').map(line =>
            new Paragraph({ children: [new TextRun(line)] })
          ),
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = `${path.parse(file.originalname).name}_converted.docx`;
      const outputPath = path.join(TEMP_DIR, filename);
      await fs.writeFile(outputPath, buffer);
      const stats = await fs.stat(outputPath);

      return { outputFile: { filename, path: outputPath, size: stats.size }, pageCount: data.numpages };
    } catch (error) {
      logger.error('Error converting PDF to DOCX:', error);
      throw new Error('Failed to convert to DOCX. DOCX library may not be available.');
    }
  }

  async saveTextFile(text, originalName, encoding = 'utf8') {
    await ensureDir(TEMP_DIR);
    const filename = `${path.parse(originalName).name}_converted.txt`;
    const outputPath = path.join(TEMP_DIR, filename);
    await fs.writeFile(outputPath, text, encoding);
    const stats = await fs.stat(outputPath);
    return { filename, path: outputPath, size: stats.size };
  }

  _parseMetadata(data) {
    const info = data.info || {};
    const parsePdfDate = (str) => {
      if (!str) return null;
      const m = str.match(/^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
      if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`);
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    };
    return {
      title: info.Title || info.title || '',
      author: info.Author || info.author || '',
      subject: info.Subject || info.subject || '',
      creator: info.Creator || info.creator || '',
      producer: info.Producer || info.producer || '',
      creationDate: parsePdfDate(info.CreationDate || info.creationDate),
      modificationDate: parsePdfDate(info.ModDate || info.modificationDate),
      pageCount: data.numpages,
    };
  }

  async updateProgress(jobId, progress) {
    if (!jobId) return;
    try { await PDFJob.findByIdAndUpdate(jobId, { progress }); } catch (error) { logger.error('Error updating PDF job progress:', error); }
  }

  async getJobStatus(jobId) { return await PDFJob.findById(jobId); }

  async getJobResults(jobId) {
    const job = await PDFJob.findById(jobId);
    if (!job) throw new Error('PDF job not found');
    if (job.status !== 'completed') throw new Error('PDF job not completed');
    return job.results;
  }

  async deleteJob(jobId) {
    const job = await PDFJob.findById(jobId);
    if (!job) throw new Error('PDF job not found');
    try {
      if (job.filePath && await fs.access(job.filePath).then(() => true).catch(() => false)) await fs.unlink(job.filePath);
      if (job.results?.outputFile?.path && await fs.access(job.results.outputFile.path).then(() => true).catch(() => false)) await fs.unlink(job.results.outputFile.path);
      if (job.results?.images) for (const image of job.results.images) if (await fs.access(image.path).then(() => true).catch(() => false)) await fs.unlink(image.path);
      if (job.results?.pages) for (const p of job.results.pages) if (p.path && await fs.access(p.path).then(() => true).catch(() => false)) await fs.unlink(p.path);
    } catch (error) { logger.error('Error cleaning up PDF job files:', error); }
    await PDFJob.findByIdAndDelete(jobId);
    return { message: 'PDF job deleted successfully' };
  }

  async getUserJobs(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const jobs = await PDFJob.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await PDFJob.countDocuments({ userId });
    return { jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async downloadProcessedFile(jobId) {
    const job = await PDFJob.findById(jobId);
    if (!job) throw new Error('PDF job not found');
    if (job.status !== 'completed') throw new Error('PDF job not completed');
    let filePath, fileName;
    if (job.results?.outputFile?.path) {
      filePath = job.results.outputFile.path;
      fileName = job.results.outputFile.filename;
    } else {
      throw new Error('No processed file available');
    }
    job.downloadCount += 1;
    await job.save();
    return { filePath, fileName, originalName: job.originalName };
  }

  async createImagesZip(jobId) {
    const job = await PDFJob.findById(jobId);
    if (!job) throw new Error('PDF job not found');
    if (job.status !== 'completed') throw new Error('PDF job not completed');

    if (job.results?.outputFile?.path) {
      try {
        const data = await fs.readFile(job.results.outputFile.path);
        if (data && data.length > 0) return data;
      } catch (err) {
        logger.warn(`Stored ZIP not found at ${job.results.outputFile.path}, rebuilding...`);
      }
    }

    const images = job.results?.images;
    if (!images || images.length === 0) throw new Error('No images found for this job');

    const JSZip = require('jszip');
    const zip = new JSZip();
    let added = 0;
    for (const img of images) {
      if (img.filename.endsWith('.json')) continue;
      try {
        const fileData = await fs.readFile(img.path);
        if (fileData && fileData.length > 0) {
          zip.file(img.filename, fileData);
          added++;
        }
      } catch (err) {
        logger.warn(`Cannot read ${img.path}: ${err.message}`);
      }
    }
    if (added === 0) throw new Error('No image files could be read from disk');
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }
}

module.exports = new PDFService();
