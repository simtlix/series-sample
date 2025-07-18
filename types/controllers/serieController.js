const { BusinessError } = require('../validators/customErrors');

const serieController = {
  onSaving: async (doc, _args, _session) => {
    console.log(`A new serie titled "${doc.name}" is being created.`);

    // Ensure categories are trimmed and unique
    if (doc.categories && Array.isArray(doc.categories)) {
      doc.categories = [...new Set(doc.categories.map(cat => cat.trim()).filter(cat => cat.length > 0))];
    }
  },

  onUpdating: async (id, doc, _session) => {
    console.log(`The serie with id "${id}" is being updated.`);
    // 'doc' contains only the fields that are being changed.
    // We can prevent certain fields from being updated.
    if (doc.createdAt) {
      delete doc.createdAt;
    }
  },

  onDelete: async (doc, session) => {
    console.log(`The serie "${doc.name}" is being deleted.`);
    // Check if serie has seasons before deletion
    try {
      const mongoose = require('mongoose');
      const seasonModel = mongoose.model('season');
      const seasons = await seasonModel.find({ serie: doc._id }).session(session);
      if (seasons.length > 0) {
        throw new BusinessError(`Cannot delete serie "${doc.name}" because it has ${seasons.length} seasons.`);
      }
    } catch (error) {
      console.warn(`Could not check for seasons during serie deletion: ${error.message}`);
      // Continue with deletion even if season check fails
    }
  }
};

module.exports = serieController; 