const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const ScrapeJob = require('../models/ScrapeJob');
const logger = require('../utils/logger');

class ScrapingService {
  async scrapeUrl(url, options = {}) {
    try {
      logger.info(`Starting URL scrape: ${url}`);
      
      const scrapeJob = await ScrapeJob.create({
        targetUrl: url,
        scrapingType: 'url',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      let results;
      
      if (options.usePuppeteer || options.extractImages || options.extractTables) {
        results = await this.scrapeWithPuppeteer(url, options, scrapeJob._id);
      } else {
        results = await this.scrapeWithCheerio(url, options, scrapeJob._id);
      }

      await scrapeJob.completeJob(results);
      return { job: scrapeJob, results };
    } catch (error) {
      logger.error('Error scraping URL:', error);
      throw error;
    }
  }

  async scrapeImages(url, options = {}) {
    try {
      logger.info(`Starting image scrape: ${url}`);
      
      const scrapeJob = await ScrapeJob.create({
        targetUrl: url,
        scrapingType: 'images',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      const results = await this.scrapeWithPuppeteer(url, { ...options, extractImages: true }, scrapeJob._id);
      await scrapeJob.completeJob(results);
      
      return { job: scrapeJob, results };
    } catch (error) {
      logger.error('Error scraping images:', error);
      throw error;
    }
  }

  async scrapeLinks(url, options = {}) {
    try {
      logger.info(`Starting links scrape: ${url}`);
      
      const scrapeJob = await ScrapeJob.create({
        targetUrl: url,
        scrapingType: 'links',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      const results = await this.scrapeWithCheerio(url, { ...options, extractLinks: true }, scrapeJob._id);
      await scrapeJob.completeJob(results);
      
      return { job: scrapeJob, results };
    } catch (error) {
      logger.error('Error scraping links:', error);
      throw error;
    }
  }

  async scrapeMetadata(url, options = {}) {
    try {
      logger.info(`Starting metadata scrape: ${url}`);
      
      const scrapeJob = await ScrapeJob.create({
        targetUrl: url,
        scrapingType: 'metadata',
        options,
        status: 'processing',
        startedAt: new Date(),
      });

      const results = await this.scrapeWithCheerio(url, { ...options, extractMetadata: true }, scrapeJob._id);
      await scrapeJob.completeJob(results);
      
      return { job: scrapeJob, results };
    } catch (error) {
      logger.error('Error scraping metadata:', error);
      throw error;
    }
  }

  async scrapeWithCheerio(url, options, jobId) {
    try {
      await this.updateProgress(jobId, 30);
      
      const response = await axios.get(url, {
        timeout: options.timeout || 30000,
        headers: {
          'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...(options.headers || {}),
        },
      });

      await this.updateProgress(jobId, 60);

      const $ = cheerio.load(response.data);
      const results = {};

      if (options.extractTitle !== false) {
        results.title = $('title').text().trim();
      }

      if (options.extractHeadings) {
        results.headings = {
          h1: this.extractHeadings($, 'h1'),
          h2: this.extractHeadings($, 'h2'),
          h3: this.extractHeadings($, 'h3'),
          h4: this.extractHeadings($, 'h4'),
          h5: this.extractHeadings($, 'h5'),
          h6: this.extractHeadings($, 'h6'),
        };
      }

      if (options.extractParagraphs !== false) {
        results.paragraphs = this.extractParagraphs($);
      }

      if (options.extractText !== false) {
        results.text = $('body').text().trim();
      }

      if (options.extractTables) {
        results.tables = this.extractTables($);
      }

      if (options.extractLinks) {
        results.links = this.extractLinks($, url);
      }

      if (options.extractImages) {
        results.images = this.extractImages($, url);
      }

      if (options.extractMetadata !== false) {
        results.metadata = this.extractMetadata($);
      }

      await this.updateProgress(jobId, 90);
      return results;
    } catch (error) {
      logger.error('Cheerio scraping error:', error);
      throw error;
    }
  }

  async scrapeWithPuppeteer(url, options, jobId) {
    let browser;
    try {
      await this.updateProgress(jobId, 30);

      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      
      if (options.userAgent) {
        await page.setUserAgent(options.userAgent);
      }

      if (options.headers) {
        await page.setExtraHTTPHeaders(options.headers);
      }

      await this.updateProgress(jobId, 50);

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000,
      });

      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
      }

      await this.updateProgress(jobId, 70);

      const results = {};

      if (options.extractTitle !== false) {
        results.title = await page.evaluate(() => document.title);
      }

      if (options.extractHeadings) {
        results.headings = await page.evaluate(() => {
          const headings = {};
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
            headings[tag] = Array.from(document.querySelectorAll(tag)).map(h => h.textContent.trim());
          });
          return headings;
        });
      }

      if (options.extractParagraphs !== false) {
        results.paragraphs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim());
        });
      }

      if (options.extractText !== false) {
        results.text = await page.evaluate(() => document.body.innerText);
      }

      if (options.extractTables) {
        results.tables = await page.evaluate(() => {
          const tableElements = document.querySelectorAll('table');
          return Array.from(tableElements).map(table => ({
            headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim()),
            rows: Array.from(table.querySelectorAll('tr')).map(tr => 
              Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
            ),
          }));
        });
      }

      if (options.extractLinks) {
        results.links = await page.evaluate((baseUrl) => {
          const linkElements = document.querySelectorAll('a[href]');
          return Array.from(linkElements).map(link => {
            const href = link.getAttribute('href');
            const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
            return {
              text: link.textContent.trim(),
              url: fullUrl,
            };
          });
        }, url);
      }

      if (options.extractImages) {
        results.images = await page.evaluate((baseUrl) => {
          const imgElements = document.querySelectorAll('img');
          return Array.from(imgElements).map(img => {
            const src = img.getAttribute('src');
            const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
            return {
              url: fullUrl,
              alt: img.getAttribute('alt') || '',
              src: src,
            };
          });
        }, url);
      }

      if (options.extractMetadata !== false) {
        results.metadata = await page.evaluate(() => ({
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || '',
          keywords: document.querySelector('meta[name="keywords"]')?.content || '',
          author: document.querySelector('meta[name="author"]')?.content || '',
        }));
      }

      await this.updateProgress(jobId, 90);
      return results;
    } catch (error) {
      logger.error('Puppeteer scraping error:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  extractHeadings($, tag) {
    return Array.from($(tag)).map((_, element) => $(element).text().trim());
  }

  extractParagraphs($) {
    return Array.from($('p')).map((_, element) => $(element).text().trim());
  }

  extractTables($) {
    const tables = [];
    $('table').each((i, table) => {
      const tableData = {
        headers: [],
        rows: [],
      };
      
      $(table).find('tr:first th').each((j, header) => {
        tableData.headers.push($(header).text().trim());
      });
      
      $(table).find('tr').each((j, row) => {
        const rowData = [];
        $(row).find('td').each((k, cell) => {
          rowData.push($(cell).text().trim());
        });
        if (rowData.length > 0) {
          tableData.rows.push(rowData);
        }
      });
      
      if (tableData.rows.length > 0) {
        tables.push(tableData);
      }
    });
    return tables;
  }

  extractImages($, baseUrl) {
    const images = [];
    $('img').each((i, img) => {
      const src = $(img).attr('src');
      if (src) {
        const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        images.push({
          url: fullUrl,
          alt: $(img).attr('alt') || '',
          src: src,
        });
      }
    });
    return images;
  }

  extractLinks($, baseUrl) {
    const links = [];
    $('a[href]').each((i, link) => {
      const href = $(link).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
        links.push({
          text: $(link).text().trim(),
          url: fullUrl,
        });
      }
    });
    return links;
  }

  extractMetadata($) {
    return {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',
      publishedDate: $('meta[property="article:published_time"]').attr('content') || '',
    };
  }

  async updateProgress(jobId, progress) {
    try {
      await ScrapeJob.findByIdAndUpdate(jobId, { progress });
    } catch (error) {
      logger.error('Error updating progress:', error);
    }
  }

  async getJobStatus(jobId) {
    return await ScrapeJob.findById(jobId);
  }

  async getJobResults(jobId) {
    const job = await ScrapeJob.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    if (job.status !== 'completed') {
      throw new Error('Job not completed');
    }
    return job.results;
  }

  async deleteJob(jobId) {
    const job = await ScrapeJob.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    await ScrapeJob.findByIdAndDelete(jobId);
    return { message: 'Job deleted successfully' };
  }

  async getUserJobs(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const jobs = await ScrapeJob.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ScrapeJob.countDocuments({ userId });
    
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
}

module.exports = new ScrapingService();
