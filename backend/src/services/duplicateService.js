const stringSimilarity = require('string-similarity');
const Embedding = require('../models/Embedding');
const ScrapeJob = require('../models/ScrapeJob');
const aiService = require('./aiService');
const logger = require('../utils/logger');

class DuplicateService {
  async detectDuplicate(jobId, userId) {
    try {
      const job = await ScrapeJob.findById(jobId);
      if (!job || !job.results?.text) {
        return { isDuplicate: false, similarity: 0, similarJobs: [] };
      }

      const text = job.results.text;
      const embeddingResult = await aiService.generateEmbedding(text);

      if (embeddingResult.embedding) {
        const similar = await Embedding.findSimilar(userId, embeddingResult.embedding, {
          limit: 5,
          threshold: 0.85,
        });

        const filtered = similar.filter(s => s.jobId.toString() !== jobId.toString());

        if (filtered.length > 0) {
          return {
            isDuplicate: true,
            similarity: filtered[0].similarity,
            similarJobs: filtered.map(s => ({
              jobId: s.jobId,
              url: s.metadata?.url,
              title: s.metadata?.title,
              similarity: s.similarity,
            })),
          };
        }
      }

      const recentJobs = await ScrapeJob.find({
        userId,
        status: 'completed',
        'results.text': { $exists: true, $ne: '' },
        _id: { $ne: jobId },
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('_id targetUrl results.text results.metadata.title')
        .lean();

      const textSamples = recentJobs.map(j => ({
        id: j._id,
        url: j.targetUrl,
        title: j.results?.metadata?.title || '',
        text: (j.results?.text || '').slice(0, 2000),
      }));

      if (textSamples.length === 0) {
        return { isDuplicate: false, similarity: 0, similarJobs: [] };
      }

      const currentSample = text.slice(0, 2000);
      const similarities = textSamples.map(sample => ({
        jobId: sample.id,
        url: sample.url,
        title: sample.title,
        similarity: stringSimilarity.compareTwoStrings(currentSample, sample.text),
      }));

      similarities.sort((a, b) => b.similarity - a.similarity);
      const matches = similarities.filter(s => s.similarity > 0.8);

      if (matches.length > 0) {
        return {
          isDuplicate: true,
          similarity: matches[0].similarity,
          similarJobs: matches.slice(0, 5).map(m => ({
            jobId: m.jobId,
            url: m.url,
            title: m.title,
            similarity: Math.round(m.similarity * 100) / 100,
          })),
        };
      }

      return { isDuplicate: false, similarity: 0, similarJobs: [] };
    } catch (error) {
      logger.error('Duplicate detection failed:', error.message);
      return { isDuplicate: false, similarity: 0, similarJobs: [], error: error.message };
    }
  }

  async getDuplicateStats(userId) {
    try {
      const jobs = await ScrapeJob.find({
        userId,
        status: 'completed',
        'results.text': { $exists: true, $ne: '' },
      })
        .select('_id targetUrl results.text results.metadata.title createdAt')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      if (jobs.length < 2) {
        return { totalJobs: jobs.length, duplicatePairs: 0, uniqueJobs: jobs.length };
      }

      let duplicatePairs = 0;
      const threshold = 0.8;

      for (let i = 0; i < jobs.length; i++) {
        for (let j = i + 1; j < jobs.length; j++) {
          const textA = (jobs[i].results?.text || '').slice(0, 2000);
          const textB = (jobs[j].results?.text || '').slice(0, 2000);
          if (textA && textB) {
            const similarity = stringSimilarity.compareTwoStrings(textA, textB);
            if (similarity > threshold) {
              duplicatePairs++;
            }
          }
        }
      }

      return {
        totalJobs: jobs.length,
        duplicatePairs,
        uniqueJobs: jobs.length - duplicatePairs,
      };
    } catch (error) {
      logger.error('Duplicate stats failed:', error.message);
      return { totalJobs: 0, duplicatePairs: 0, uniqueJobs: 0, error: error.message };
    }
  }
}

module.exports = new DuplicateService();
