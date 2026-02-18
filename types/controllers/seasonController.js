import * as simfinity from '@simtlix/simfinity-js';

const seasonController = {
  onSaving: async (doc, _args, session) => {
    // Set description when creating a new season
    if (doc.serie && doc.number != null) {
      let serieName;
      
     
      // Otherwise, look it up by ID
      const serieModel = simfinity.getModel(simfinity.getType('serie'));
      if (!serieModel) {
        return; // Model not yet registered
      }
        
      // Handle both ObjectId and object with id property
      const serieId = doc.serie;
      const serie = await serieModel.findById(serieId).session(session);
        
      if (serie) {
        serieName = serie.name;
      }
      
      
      if (serieName) {
        doc.description = `${serieName} ${doc.number}`;
      }
    }
  },

  onUpdating: async (id, doc, session) => {
    // Update description if serie or number is being changed
    if (Object.prototype.hasOwnProperty.call(doc, 'serie') || Object.prototype.hasOwnProperty.call(doc, 'number')) {
      const seasonModel = simfinity.getModel(simfinity.getType('season'));
      if (!seasonModel) {
        return; // Model not yet registered
      }
      
      const existingSeason = await seasonModel.findById(id).session(session);
      
      if (existingSeason) {
        // Get the serie ID (from update or existing)
        const serieId = Object.prototype.hasOwnProperty.call(doc, 'serie') ? doc.serie : existingSeason.serie;
        
        // Get the number (from update or existing)
        const number = Object.prototype.hasOwnProperty.call(doc, 'number') ? doc.number : existingSeason.number;
        
        if (serieId && number != null) {
          const serieModel = simfinity.getModel(simfinity.getType('serie'));
          if (!serieModel) {
            return; // Model not yet registered
          }
          
          const serie = await serieModel.findById(serieId).session(session);
          
          if (serie) {
            doc.description = `${serie.name} ${number}`;
          }
        }
      }
    }
  }
};

export default seasonController;

