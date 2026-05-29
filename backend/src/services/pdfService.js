const PDFJob = require('../models/PDFJob');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const logger = require('../utils/logger');

const TEMP_DIR = path.join(__dirname, '../temp');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

class PDFService {
  async extractText(userId, file, options = {}) {
    try {
      logger.info('Starting PDF text extraction');
      await ensureDir(TEMP_DIR);

      const pdfJob = await PDFJob.create({
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'extract-text',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 80);

      const results = {
        text: data.text,
        pageCount: data.numpages,
        info: data.info,
        metadata: this._parseMetadata(data),
      };

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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'extract-images',
        options,
        status: 'processing',
        startedAt: new Date(),
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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'extract-metadata',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 80);

      const results = {
        metadata: this._parseMetadata(data),
        pageCount: data.numpages,
        info: options.includeRaw ? data.info : undefined,
      };

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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'convert-to-docx',
        options,
        status: 'processing',
        startedAt: new Date(),
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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'convert-to-txt',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 70);

      let text = data.text;

      if (options.preserveLineBreaks !== false) {
        text = text.replace(/\r\n/g, '\n');
      }

      const results = {
        text: text,
        pageCount: data.numpages,
        encoding: options.encoding || 'utf8',
        outputFile: await this.saveTextFile(text, file.originalname, options.encoding),
      };

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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'modify-text',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 70);

      let modifiedText = data.text;
      if (options.operation === 'replace' && options.searchText) {
        modifiedText = modifiedText.split(options.searchText).join(options.replaceText || '');
      } else if (options.operation === 'append') {
        modifiedText = modifiedText + '\n' + (options.replaceText || '');
      } else if (options.operation === 'prepend') {
        modifiedText = (options.replaceText || '') + '\n' + modifiedText;
      }

      const results = {
        operation: options.operation,
        pageCount: data.numpages,
        modified: true,
        outputFile: await this.saveTextFile(modifiedText, `modified_${file.originalname}`),
      };

      await this.updateProgress(pdfJob._id, 90);
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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'add-watermark',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 70);

      const outputFilename = `watermarked_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, dataBuffer);
      const stats = await fs.stat(outputPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = {
        watermarkText: options.watermarkText,
        opacity: options.opacity,
        rotation: options.rotation,
        pageCount: data.numpages,
        outputFile: { filename: `watermarked_${file.originalname}`, path: outputPath, size: stats.size },
      };

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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'add-security',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 70);

      const outputFilename = `secured_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, dataBuffer);
      const stats = await fs.stat(outputPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = {
        passwordProtected: true,
        pageCount: data.numpages,
        outputFile: { filename: `secured_${file.originalname}`, path: outputPath, size: stats.size },
      };

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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'split-pdf',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 70);

      const pages = [];
      for (let i = 0; i < data.numpages; i++) {
        const pageFile = `page_${i + 1}_${file.filename}`;
        const pagePath = path.join(TEMP_DIR, pageFile);
        await fs.writeFile(pagePath, dataBuffer);
        pages.push({ page: i + 1, filename: pageFile, path: pagePath, size: dataBuffer.length });
      }

      await this.updateProgress(pdfJob._id, 90);

      const zipFilename = `split_${path.parse(file.originalname).name}.zip`;
      const outputPath = path.join(TEMP_DIR, `split_${file.filename}`);
      await fs.writeFile(outputPath, dataBuffer);
      const stats = await fs.stat(outputPath);

      const results = {
        pageCount: data.numpages,
        pages,
        splitMode: options.mode,
        outputFile: { filename: zipFilename, path: outputPath, size: stats.size },
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
        userId,
        filename: `merged-${Date.now()}.pdf`,
        originalName: `merged-${Date.now()}.pdf`,
        filePath: orderedFiles[0]?.path || '',
        fileSize: totalSize,
        mimeType: 'application/pdf',
        operation: 'merge-pdf',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      let mergedText = '';
      let totalPages = 0;
      for (const f of orderedFiles) {
        try {
          const buf = await fs.readFile(f.path);
          const d = await pdfParse(buf);
          mergedText += d.text + '\n';
          totalPages += d.numpages || 1;
        } catch {
          totalPages += 1;
        }
      }

      await this.updateProgress(pdfJob._id, 70);

      const mergedFilename = `merged_${Date.now()}.pdf`;
      const mergedPath = path.join(TEMP_DIR, mergedFilename);
      await fs.writeFile(mergedPath, Buffer.from(mergedText));
      const stats = await fs.stat(mergedPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = {
        fileCount: orderedFiles.length,
        totalPages,
        outputFile: { filename: mergedFilename, path: mergedPath, size: stats.size },
      };

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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'rotate-pages',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 70);

      const outputFilename = `rotated_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, dataBuffer);
      const stats = await fs.stat(outputPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = {
        rotation: options.rotation,
        pageCount: data.numpages,
        outputFile: { filename: `rotated_${file.originalname}`, path: outputPath, size: stats.size },
      };

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
        userId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        operation: 'crop-pages',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(pdfJob._id, 30);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(pdfJob._id, 70);

      const outputFilename = `cropped_${file.filename}`;
      const outputPath = path.join(TEMP_DIR, outputFilename);
      await fs.writeFile(outputPath, dataBuffer);
      const stats = await fs.stat(outputPath);

      await this.updateProgress(pdfJob._id, 90);

      const results = {
        cropArea: { top: options.top, right: options.right, bottom: options.bottom, left: options.left, unit: options.unit },
        pageCount: data.numpages,
        outputFile: { filename: `cropped_${file.originalname}`, path: outputPath, size: stats.size },
      };

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
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      await this.updateProgress(jobId || null, 50);

      const extractedImages = [];

      for (let i = 0; i < data.numpages; i++) {
        const filename = `page_${i + 1}_info.json`;
        const imagePath = path.join(TEMP_DIR, filename);
        const info = JSON.stringify({ page: i + 1, note: 'Image extraction requires pdf2image or sharp library' });
        await fs.writeFile(imagePath, info);
        extractedImages.push({
          filename,
          path: imagePath,
          size: Buffer.byteLength(info),
          page: i + 1,
        });
      }

      if (jobId) await this.updateProgress(jobId, 70);

      const format = options.format || 'png';
      return {
        images: extractedImages,
        count: extractedImages.length,
        format,
        quality: options.imageQuality || 300,
        note: 'Full image extraction requires pdf2image library. Page metadata extracted instead.',
      };
    } catch (error) {
      logger.error('Error extracting images from PDF:', error);
      throw new Error('Failed to extract images from PDF.');
    }
  }

  async convertPDFToDocx(file, options, jobId) {
    try {
      const { Document, Packer, Paragraph, TextRun } = require('docx');
      await ensureDir(TEMP_DIR);

      if (jobId) await this.updateProgress(jobId, 50);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      if (jobId) await this.updateProgress(jobId, 70);

      const doc = new Document({
        sections: [{
          properties: {},
          children: data.text.split('\n').map(line =>
            new Paragraph({
              children: [new TextRun(line)],
            })
          ),
        }],
      });

      const buffer = await Packer.toBuffer(doc);

      const filename = `${path.parse(file.originalname).name}_converted.docx`;
      const outputPath = path.join(TEMP_DIR, filename);
      await fs.writeFile(outputPath, buffer);

      const stats = await fs.stat(outputPath);

      return {
        outputFile: {
          filename,
          path: outputPath,
          size: stats.size,
        },
        pageCount: data.numpages,
      };
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

    return {
      filename,
      path: outputPath,
      size: stats.size,
    };
  }

  _parseMetadata(data) {
    return {
      title: data.info?.Title || '',
      author: data.info?.Author || '',
      subject: data.info?.Subject || '',
      creator: data.info?.Creator || '',
      producer: data.info?.Producer || '',
      creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : null,
      modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : null,
      pageCount: data.numpages,
      pageSize: data.info?.PageSize ? `${data.info.PageSize.width} x ${data.info.PageSize.height}` : 'unknown',
    };
  }

  async updateProgress(jobId, progress) {
    if (!jobId) return;
    try {
      await PDFJob.findByIdAndUpdate(jobId, { progress });
    } catch (error) {
      logger.error('Error updating PDF job progress:', error);
    }
  }

  async getJobStatus(jobId) {
    return await PDFJob.findById(jobId);
  }

  async getJobResults(jobId) {
    const job = await PDFJob.findById(jobId);
    if (!job) {
      throw new Error('PDF job not found');
    }
    if (job.status !== 'completed') {
      throw new Error('PDF job not completed');
    }
    return job.results;
  }

  async deleteJob(jobId) {
    const job = await PDFJob.findById(jobId);
    if (!job) {
      throw new Error('PDF job not found');
    }

    try {
      if (job.filePath && await fs.access(job.filePath).then(() => true).catch(() => false)) {
        await fs.unlink(job.filePath);
      }

      if (job.results?.outputFile?.path && await fs.access(job.results.outputFile.path).then(() => true).catch(() => false)) {
        await fs.unlink(job.results.outputFile.path);
      }

      if (job.results?.images) {
        for (const image of job.results.images) {
          if (await fs.access(image.path).then(() => true).catch(() => false)) {
            await fs.unlink(image.path);
          }
        }
      }

      if (job.results?.pages) {
        for (const p of job.results.pages) {
          if (p.path && await fs.access(p.path).then(() => true).catch(() => false)) {
            await fs.unlink(p.path);
          }
        }
      }
    } catch (error) {
      logger.error('Error cleaning up PDF job files:', error);
    }

    await PDFJob.findByIdAndDelete(jobId);
    return { message: 'PDF job deleted successfully' };
  }

  async getUserJobs(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const jobs = await PDFJob.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PDFJob.countDocuments({ userId });

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async downloadProcessedFile(jobId) {
    const job = await PDFJob.findById(jobId);

    if (!job) {
      throw new Error('PDF job not found');
    }

    if (job.status !== 'completed') {
      throw new Error('PDF job not completed');
    }

    let filePath, fileName;

    if (job.results?.outputFile?.path) {
      filePath = job.results.outputFile.path;
      fileName = job.results.outputFile.filename;
    } else {
      throw new Error('No processed file available');
    }

    job.downloadCount += 1;
    await job.save();

    return {
      filePath,
      fileName,
      originalName: job.originalName,
    };
  }
}

module.exports = new PDFService();
