const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScrapeJob',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  metadata: {
    url: String,
    title: String,
    category: String,
    keywords: [String],
    summary: String,
  },
  model: {
    type: String,
    default: 'text-embedding-3-small',
  },
  dimensions: {
    type: Number,
    default: 1536,
  },
}, {
  timestamps: true,
});

embeddingSchema.index({ userId: 1, createdAt: -1 });
embeddingSchema.index({ jobId: 1 });
embeddingSchema.index({ 'metadata.url': 1 });

embeddingSchema.statics.findSimilar = async function(userId, embedding, options = {}) {
  const { limit = 10, threshold = 0.8 } = options;
  
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $addFields: {
        similarity: {
          $function: {
            args: ['$embedding', embedding],
            lang: 'javascript',
            body: `function(a, b) {
              if (!a || !b || a.length !== b.length) return 0;
              let dotProduct = 0;
              let normA = 0;
              let normB = 0;
              for (let i = 0; i < a.length; i++) {
                dotProduct += a[i] * b[i];
                normA += a[i] * a[i];
                normB += b[i] * b[i];
              }
              return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
            }`
          }
        }
      }
    },
    { $match: { similarity: { $gte: threshold } } },
    { $sort: { similarity: -1 } },
    { $limit: limit },
    { $project: { embedding: 0 } },
  ];

  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Embedding', embeddingSchema);
