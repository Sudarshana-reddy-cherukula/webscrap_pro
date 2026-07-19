const PDFDocument = require('pdf-lib');
const ScrapeJob = require('../models/ScrapeJob');
const aiService = require('./aiService');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

class ReportService {
  async generateReport(jobId, userId, options = {}) {
    try {
      const job = await ScrapeJob.findOne({ _id: jobId, userId });
      if (!job) {
        throw new Error('Job not found');
      }

      const { includeSummary = true, includeKeywords = true, includeMetadata = true } = options;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      const titleFont = await pdfDoc.embedFont('Helvetica-Bold');
      const normalFont = await pdfDoc.embedFont('Helvetica');
      const boldFont = await pdfDoc.embedFont('Helvetica-Bold');

      let yPosition = height - 50;

      page.drawText('WebScrap Pro - Content Report', {
        x: 50,
        y: yPosition,
        size: 20,
        font: titleFont,
        color: PDFDocument.rgb(0.1, 0.6, 0.8),
      });
      yPosition -= 30;

      page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: normalFont,
        color: PDFDocument.rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 20;

      if (includeMetadata && job.results?.metadata) {
        yPosition = this.drawSection(page, yPosition, 'Metadata', normalFont, boldFont, width);
        
        const metadata = job.results.metadata;
        if (metadata.title) {
          page.drawText(`Title: ${metadata.title}`, {
            x: 50, y: yPosition, size: 10, font: normalFont,
          });
          yPosition -= 15;
        }
        if (metadata.description) {
          const desc = metadata.description.slice(0, 100);
          page.drawText(`Description: ${desc}`, {
            x: 50, y: yPosition, size: 10, font: normalFont,
          });
          yPosition -= 15;
        }
        if (metadata.author) {
          page.drawText(`Author: ${metadata.author}`, {
            x: 50, y: yPosition, size: 10, font: normalFont,
          });
          yPosition -= 15;
        }
        yPosition -= 10;
      }

      if (includeSummary && job.results?.text) {
        const summaryResult = await aiService.summarize(job.results.text, { style: 'concise', maxLength: 500 });
        
        if (summaryResult.summary) {
          yPosition = this.drawSection(page, yPosition, 'Summary', normalFont, boldFont, width);
          
          const summaryLines = this.wrapText(summaryResult.summary, normalFont, 10, width - 100);
          for (const line of summaryLines) {
            if (yPosition < 50) {
              const newPage = pdfDoc.addPage();
              yPosition = newPage.getSize().height - 50;
              newPage.drawText(line, {
                x: 50, y: yPosition, size: 10, font: normalFont,
              });
            } else {
              page.drawText(line, {
                x: 50, y: yPosition, size: 10, font: normalFont,
              });
            }
            yPosition -= 15;
          }
          yPosition -= 10;
        }
      }

      if (includeKeywords && job.results?.text) {
        const kwResult = await aiService.extractKeywords(job.results.text, { maxKeywords: 10 });
        
        if (kwResult.keywords?.length > 0) {
          yPosition = this.drawSection(page, yPosition, 'Keywords', normalFont, boldFont, width);
          
          for (const kw of kwResult.keywords) {
            page.drawText(`• ${kw.keyword}`, {
              x: 50, y: yPosition, size: 10, font: normalFont,
            });
            yPosition -= 15;
          }
          yPosition -= 10;
        }
      }

      if (job.results?.text) {
        yPosition = this.drawSection(page, yPosition, 'Content', normalFont, boldFont, width);
        
        const content = job.results.text.slice(0, 5000);
        const contentLines = this.wrapText(content, normalFont, 10, width - 100);
        
        for (const line of contentLines.slice(0, 50)) {
          if (yPosition < 50) {
            const newPage = pdfDoc.addPage();
            yPosition = newPage.getSize().height - 50;
            newPage.drawText(line, {
              x: 50, y: yPosition, size: 10, font: normalFont,
            });
          } else {
            page.drawText(line, {
              x: 50, y: yPosition, size: 10, font: normalFont,
            });
          }
          yPosition -= 15;
        }
      }

      page.drawText('WebScrap Pro', {
        x: 50,
        y: 30,
        size: 8,
        font: normalFont,
        color: PDFDocument.rgb(0.5, 0.5, 0.5),
      });

      const pdfBytes = await pdfDoc.save();
      
      const reportsDir = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const fileName = `report-${jobId}-${Date.now()}.pdf`;
      const filePath = path.join(reportsDir, fileName);
      fs.writeFileSync(filePath, pdfBytes);

      logger.info('PDF report generated', { jobId, filePath });
      
      return { filePath, fileName, fileSize: pdfBytes.length };
    } catch (error) {
      logger.error('Report generation failed:', error.message);
      throw error;
    }
  }

  drawSection(page, yPosition, title, normalFont, boldFont, pageWidth) {
    page.drawText(title, {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: PDFDocument.rgb(0.1, 0.1, 0.1),
    });
    
    page.drawLine({
      start: { x: 50, y: yPosition - 5 },
      end: { x: pageWidth - 50, y: yPosition - 5 },
      thickness: 1,
      color: PDFDocument.rgb(0.8, 0.8, 0.8),
    });
    
    return yPosition - 25;
  }

  wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
}

module.exports = new ReportService();
