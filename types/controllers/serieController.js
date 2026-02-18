import { BusinessError } from '../validators/customErrors.js';
import mongoose from 'mongoose';
import * as simfinity from '@simtlix/simfinity-js';

const serieController = {
  onSaving: async (doc, _args, _session) => {
    console.log(`A new serie titled "${doc.name}" is being created.`);

    // Ensure categories are trimmed and unique
    if (doc.categories && Array.isArray(doc.categories)) {
      doc.categories = [...new Set(doc.categories.map(cat => cat.trim()).filter(cat => cat.length > 0))];
    }
  },

  onUpdating: async (id, doc, session) => {
    console.log(`The serie with id "${id}" is being updated.`);
    // 'doc' contains only the fields that are being changed.
    // We can prevent certain fields from being updated.
    if (doc.createdAt) {
      delete doc.createdAt;
    }

    // If the serie name is being updated, update all child seasons' descriptions
    if (Object.prototype.hasOwnProperty.call(doc, 'name')) {
      try {
        const seasonModel = simfinity.getModel(simfinity.getType('season'));
        
        if (seasonModel && doc.name) {
          // Load all child seasons
          const seasons = await seasonModel.find({ serie: id }).session(session);
          
          // Update each season's description
          for (const season of seasons) {
            if (season.number != null) {
              season.description = `${doc.name} ${season.number}`;
              await season.save({ session });
            }
          }
        }
      } catch (error) {
        console.warn(`Could not update season descriptions: ${error.message}`);
        // Continue with serie update even if season update fails
      }
    }
  },

  onDelete: async (doc, session) => {
    console.log(`The serie "${doc.name}" is being deleted.`);
    // Check if serie has seasons before deletion
    try {
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

export default serieController; 