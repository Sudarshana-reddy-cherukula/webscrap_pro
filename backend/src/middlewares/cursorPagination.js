const mongoose = require('mongoose');

const cursorPagination = (Model, options = {}) => {
  const { defaultLimit = 20, maxLimit = 100, sortField = 'createdAt', sortOrder = -1 } = options;

  return async (req, res, next) => {
    try {
      const { cursor, limit: rawLimit, ...filters } = req.query;
      const limit = Math.min(parseInt(rawLimit) || defaultLimit, maxLimit);

      const query = {};
      if (req.user?._id) query.userId = req.user._id;

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'status') query.status = value;
          else if (key === 'enabled') query.enabled = value === 'true';
          else if (key === 'search') {
            query.$or = [
              { name: { $regex: value, $options: 'i' } },
              { description: { $regex: value, $options: 'i' } },
            ];
          }
        }
      });

      if (cursor) {
        const cursorDoc = await Model.findById(cursor).select('_id ' + sortField).lean();
        if (cursorDoc) {
          const cursorValue = cursorDoc[sortField] || cursorDoc._id.getTimestamp();
          query[sortField] = sortOrder === -1
            ? { $lt: cursorValue }
            : { $gt: cursorValue };
        }
      }

      const sort = { [sortField]: sortOrder };
      const docs = await Model.find(query).sort(sort).limit(limit + 1).lean();

      const hasMore = docs.length > limit;
      const items = hasMore ? docs.slice(0, limit) : docs;
      const nextCursor = hasMore ? items[items.length - 1]._id.toString() : null;

      res.locals.pagination = {
        items,
        nextCursor,
        hasMore,
        limit,
        sortField,
        sortOrder,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

const formatCursorResponse = (req, res) => {
  const { items, nextCursor, hasMore, limit } = res.locals.pagination || {};

  if (items === undefined) return res.status(500).json({ success: false, message: 'Pagination middleware not applied' });

  const response = {
    success: true,
    data: {
      items,
      pagination: {
        nextCursor,
        hasMore,
        limit,
      },
    },
  };

  res.json(response);
};

module.exports = { cursorPagination, formatCursorResponse };
