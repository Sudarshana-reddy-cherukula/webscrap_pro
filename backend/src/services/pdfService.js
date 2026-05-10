const PDFJob = require('../models/PDFJob');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const logger = require('../utils/logger');

class PDFService {
  async extractText(file, options = {}) {
    try {
      logger.info('Starting PDF text extraction');
      
      const pdfJob = await PDFJob.create({
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
        metadata: this.extractMetadata(data),
      };

      await pdfJob.completeJob(results);
      
      return { job: pdfJob, results };
    } catch (error) {
      logger.error('Error extracting text from PDF:', error);
      throw error;
    }
  }

  async extractImages(file, options = {}) {
    try {
      logger.info('Starting PDF image extraction');
      
      const pdfJob = await PDFJob.create({
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

  async extractMetadata(file, options = {}) {
    try {
      logger.info('Starting PDF metadata extraction');
      
      const pdfJob = await PDFJob.create({
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
        metadata: this.extractMetadata(data),
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

  async convertToDocx(file, options = {}) {
    try {
      logger.info('Starting PDF to DOCX conversion');
      
      const pdfJob = await PDFJob.create({
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

  async convertToTxt(file, options = {}) {
    try {
      logger.info('Starting PDF to TXT conversion');
      
      const pdfJob = await PDFJob.create({
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

  async extractImagesFromPDF(filePath, options, jobId) {
    try {
      const pdf2image = require('pdf2image');
      const imageQuality = options.imageQuality || 300;
      const format = options.format || 'png';
      
      await this.updateProgress(jobId, 50);

      const images = await pdf2image.convert(filePath, {
        dpi: imageQuality,
        format: format,
      });

      await this.updateProgress(jobId, 70);

      const extractedImages = [];
      const tempDir = path.join(__dirname, '../temp');
      await fs.mkdir(tempDir, { recursive: true });

      for (let i = 0; i < images.length; i++) {
        const filename = `page_${i + 1}.${format}`;
        const imagePath = path.join(tempDir, filename);
        
        await fs.writeFile(imagePath, images[i]);
        
        const stats = await fs.stat(imagePath);
        extractedImages.push({
          filename,
          path: imagePath,
          size: stats.size,
          page: i + 1,
        });
      }

      return {
        images: extractedImages,
        count: extractedImages.length,
        format,
        quality: imageQuality,
      };
    } catch (error) {
      logger.error('Error extracting images from PDF:', error);
      throw new Error('Failed to extract images. PDF2Image library may not be available.');
    }
  }

  async convertPDFToDocx(file, options, jobId) {
    try {
      const { Document, Packer, Paragraph, TextRun } = require('docx');
      
      await this.updateProgress(jobId, 50);

      const dataBuffer = await fs.readFile(file.path);
      const data = await pdfParse(dataBuffer);

      await this.updateProgress(jobId, 70);

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
      
      const tempDir = path.join(__dirname, '../temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const filename = `${path.parse(file.originalname).name}_converted.docx`;
      const outputPath = path.join(tempDir, filename);
      
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
    try {
      const tempDir = path.join(__dirname, '../temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const filename = `${path.parse(originalName).name}_converted.txt`;
      const outputPath = path.join(tempDir, filename);
      
      await fs.writeFile(outputPath, text, encoding);
      
      const stats = await fs.stat(outputPath);

      return {
        filename,
        path: outputPath,
        size: stats.size,
      };
    } catch (error) {
      logger.error('Error saving text file:', error);
      throw error;
    }
  }

  extractMetadata(data) {
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
