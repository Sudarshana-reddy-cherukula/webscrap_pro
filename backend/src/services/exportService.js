const Export = require('../models/Export');
const fs = require('fs').promises;
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const logger = require('../utils/logger');

class ExportService {
  async createExportJob(userId, sourceType, sourceId, exportType, options = {}) {
    try {
      logger.info('Starting export job');
      
      const exportJob = await Export.create({
        userId,
        sourceType,
        sourceId,
        exportType,
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      await this.updateProgress(exportJob._id, 10);

      let sourceData;
      
      switch (sourceType) {
        case 'scraping':
          sourceData = await this.getScrapingData(sourceId);
          break;
        case 'pdf':
          sourceData = await this.getPDFData(sourceId);
          break;
        default:
          throw new Error(`Unsupported source type: ${sourceType}`);
      }

      await this.updateProgress(exportJob._id, 30);

      let filePath;
      
      switch (exportType) {
        case 'csv':
          filePath = await this.exportToCSV(sourceData, options, exportJob._id);
          break;
        case 'json':
          filePath = await this.exportToJSON(sourceData, options, exportJob._id);
          break;
        case 'txt':
          filePath = await this.exportToTXT(sourceData, options, exportJob._id);
          break;
        case 'pdf':
          filePath = await this.exportToPDF(sourceData, options, exportJob._id);
          break;
        default:
          throw new Error(`Unsupported export type: ${exportType}`);
      }

      await this.updateProgress(exportJob._id, 90);

      const fileStats = await fs.stat(filePath);
      const results = {
        filePath,
        fileName: path.basename(filePath),
        fileSize: fileStats.size,
        recordCount: this.getRecordCount(sourceData),
      };

      await exportJob.completeJob(results);
      
      return { job: exportJob, results };
    } catch (error) {
      logger.error('Error creating export job:', error);
      throw error;
    }
  }

  async getScrapingData(scrapeJobId) {
    const ScrapeJob = require('../models/ScrapeJob');
    const job = await ScrapeJob.findById(scrapeJobId);
    
    if (!job) {
      throw new Error('Scraping job not found');
    }
    
    if (job.status !== 'completed') {
      throw new Error('Scraping job not completed');
    }
    
    return job.results;
  }

  async getPDFData(pdfJobId) {
    const PDFJob = require('../models/PDFJob');
    const job = await PDFJob.findById(pdfJobId);
    
    if (!job) {
      throw new Error('PDF job not found');
    }
    
    if (job.status !== 'completed') {
      throw new Error('PDF job not completed');
    }
    
    return job.results;
  }

  async exportToCSV(data, options, jobId) {
    try {
      const exportDir = path.join(__dirname, '../exports');
      await fs.mkdir(exportDir, { recursive: true });
      
      const filename = `export_${jobId}_${Date.now()}.csv`;
      const filePath = path.join(exportDir, filename);

      let csvData = this.flattenData(data);
      
      if (csvData.length === 0) {
        csvData = [{ message: 'No data available for export' }];
      }

      const headers = Object.keys(csvData[0]).map(key => ({
        id: key,
        title: key,
      }));

      const csvWriter = createCsvWriter({
        path: filePath,
        header: headers,
      });

      await csvWriter.writeRecords(csvData);
      return filePath;
    } catch (error) {
      logger.error('CSV export error:', error);
      throw error;
    }
  }

  async exportToJSON(data, options, jobId) {
    try {
      const exportDir = path.join(__dirname, '../exports');
      await fs.mkdir(exportDir, { recursive: true });
      
      const filename = `export_${jobId}_${Date.now()}.json`;
      const filePath = path.join(exportDir, filename);

      const jsonData = {
        exportedAt: new Date().toISOString(),
        data: data,
        recordCount: this.getRecordCount(data),
        options: options,
      };

      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      return filePath;
    } catch (error) {
      logger.error('JSON export error:', error);
      throw error;
    }
  }

  async exportToTXT(data, options, jobId) {
    try {
      const exportDir = path.join(__dirname, '../exports');
      await fs.mkdir(exportDir, { recursive: true });
      
      const filename = `export_${jobId}_${Date.now()}.txt`;
      const filePath = path.join(exportDir, filename);

      let textContent = '';
      
      if (typeof data === 'object') {
        textContent = this.objectToText(data, options);
      } else {
        textContent = String(data);
      }
      
      if (data.images && data.images.length > 0) {
        textContent += 'IMAGES:\n';
        data.images.forEach(image => {
          textContent += `${image.alt || ''}\t${image.url}\n`;
        });
        textContent += '\n';
      }
      
      if (data.metadata) {
        textContent += 'METADATA:\n';
        Object.entries(data.metadata).forEach(([key, value]) => {
          textContent += `${key}: ${value}\n`;
        });
      }

      const header = `Export Data - ${new Date().toISOString()}\n${'='.repeat(50)}\n\n`;
      const footer = `\n\n${'='.repeat(50)}\nExport completed at: ${new Date().toISOString()}`;
      
      await fs.writeFile(filePath, header + textContent + footer, options.encoding || 'utf8');
      return filePath;
    } catch (error) {
      logger.error('TXT export error:', error);
      throw error;
    }
  }

  createPDFFromText(text, options) {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="${options.encoding || 'utf8'}">
    <title>Export Data</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .content { white-space: pre-wrap; line-height: 1.5; }
        .footer { border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Export Data</h1>
        <p>Generated: ${new Date().toISOString()}</p>
    </div>
    <div class="content">
${text}
    </div>
    <div class="footer">
        <p>Export completed at: ${new Date().toISOString()}</p>
    </div>
</body>
</html>`;
    return htmlTemplate;
  }

  flattenData(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.flattenObject(item));
    } else if (typeof data === 'object') {
      return [this.flattenObject(data)];
    }
    return [{ value: data }];
  }

  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else if (Array.isArray(obj[key])) {
          flattened[newKey] = obj[key].join(', ');
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  objectToText(obj, options = {}, indent = 0) {
    const indentStr = '  '.repeat(indent);
    let text = '';
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          text += `${indentStr}${key}:\n`;
          text += this.objectToText(value, options, indent + 1);
        } else if (Array.isArray(value)) {
          text += `${indentStr}${key}: ${value.join(', ')}\n`;
        } else {
          text += `${indentStr}${key}: ${value}\n`;
        }
      }
    }
    
    return text;
  }

  getRecordCount(data) {
    if (Array.isArray(data)) {
      return data.length;
    } else if (typeof data === 'object') {
      return Object.keys(data).length;
    }
    return 1;
  }

  
  async exportToPDF(data, options, jobId) {
    try {
      const exportDir = path.join(__dirname, '../exports');
      await fs.mkdir(exportDir, { recursive: true });

      const filename = `export_${jobId}_${Date.now()}.pdf`;
      const filePath = path.join(exportDir, filename);

      const textContent = typeof data === 'object' ? this.objectToText(data, options) : String(data);
      const htmlContent = this.createPDFFromText(textContent, options);

      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.pdf({ path: filePath, format: 'A4', margin: { top: '20mm', bottom: '20mm' } });
      await browser.close();

      return filePath;
    } catch (error) {
      logger.error('PDF export error:', error);
      throw error;
    }
  }

  async updateProgress(jobId, progress) {
    try {
      await Export.findByIdAndUpdate(jobId, { progress });
    } catch (error) {
      logger.error('Error updating export progress:', error);
    }
  }

  async getExportStatus(exportId) {
    return await Export.findById(exportId);
  }

  async deleteExport(exportId) {
    const exportJob = await Export.findById(exportId);
    
    if (!exportJob) {
      throw new Error('Export not found');
    }

    try {
      if (exportJob.filePath && await fs.access(exportJob.filePath).then(() => true).catch(() => false)) {
        await fs.unlink(exportJob.filePath);
      }
    } catch (error) {
      logger.error('Error cleaning up export file:', error);
    }

    await Export.findByIdAndDelete(exportId);
    return { message: 'Export deleted successfully' };
  }

  async getUserExports(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const exports = await Export.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Export.countDocuments({ userId });
    
    return {
      exports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async downloadExportFile(exportId) {
    const exportJob = await Export.findById(exportId);
    
    if (!exportJob) {
      throw new Error('Export not found');
    }
    
    if (exportJob.status !== 'completed') {
      throw new Error('Export not completed');
    }
    
    if (!exportJob.filePath) {
      throw new Error('Export file not available');
    }
    
    exportJob.downloadCount += 1;
    await exportJob.save();
    
    return {
      filePath: exportJob.filePath,
      fileName: exportJob.fileName,
      exportType: exportJob.exportType,
    };
  }
}

module.exports = new ExportService();
