const { BusinessError } = require('./customErrors');


// Episode type validators
const validateEpisodeBusinessRules = async (typeName, args, modelArgs, session) => {
  const simfinity = require('@simtlix/simfinity-js');
  const episodeModel = simfinity.getModel('episode');

  // Validate episode number uniqueness within the same season
  if (Object.prototype.hasOwnProperty.call(modelArgs, 'number') || Object.prototype.hasOwnProperty.call(modelArgs, 'season')) {
    const originalEpisode = await episodeModel.findById(args.id).session(session);

    const number = Object.prototype.hasOwnProperty.call(modelArgs, 'number') ? modelArgs.number : originalEpisode.number;
    const season = Object.prototype.hasOwnProperty.call(modelArgs, 'season') ? modelArgs.season : originalEpisode.season;

    if (number != null) {
      const existingEpisode = await episodeModel.findOne({
        season,
        number,
        _id: { $ne: args.id }
      }).session(session);

      if (existingEpisode) {
        throw new BusinessError(`Episode number ${number} already exists for this season`);
      }
    }
  }
};

// Episode field validators for creation
const validateEpisodeFields = async (typeName, args, modelArgs, _session) => {
  // Basic validation for episode creation
  if (!modelArgs.number || modelArgs.number <= 0) {
    throw new BusinessError('Episode number must be a positive number');
  }
  if (!modelArgs.season) {
    throw new BusinessError('Episode must be assigned to a season');
  }
  if (!modelArgs.name || modelArgs.name.trim().length === 0) {
    throw new BusinessError('Episode name cannot be empty');
  }
};

// Star type validators
const validateStarBusinessRules = async (typeName, args, modelArgs, session) => {
  // On create, ensure star has a name
  if (!args.id && (!modelArgs.name || modelArgs.name.trim().length === 0)) {
    throw new BusinessError('Star must have a name');
  }

  // Validate star name uniqueness
  if (Object.prototype.hasOwnProperty.call(modelArgs, 'name')) {
    const simfinity = require('@simtlix/simfinity-js');
    const starModel = simfinity.getModel('star');

    if (modelArgs.name) {
      const existingStar = await starModel.findOne({
        name: modelArgs.name,
        _id: args.id ? { $ne: args.id } : undefined
      }).session(session);

      if (existingStar) {
        throw new BusinessError(`A star with the name "${modelArgs.name}" already exists`);
      }
    }
  }
};

// AssignedStarAndSerie type validators
const validateAssignedStarAndSerieBusinessRules = async (typeName, args, modelArgs, session) => {
  const simfinity = require('@simtlix/simfinity-js');

  let { serie, star } = modelArgs;

  // For uniqueness check on update, we need both IDs.
  if (args.id && (!Object.prototype.hasOwnProperty.call(modelArgs, 'serie') || !Object.prototype.hasOwnProperty.call(modelArgs, 'star'))) {
    const existingDoc = await simfinity.getModel('assignedStarAndSerie').findById(args.id).session(session);
    serie = Object.prototype.hasOwnProperty.call(modelArgs, 'serie') ? serie : existingDoc.serie;
    star = Object.prototype.hasOwnProperty.call(modelArgs, 'star') ? star : existingDoc.star;
  }

  if (Object.prototype.hasOwnProperty.call(modelArgs, 'serie')) {
    if (!serie) throw new BusinessError('serie cannot be null');
    const serieDoc = await simfinity.getModel('serie').findById(serie).session(session);
    if (!serieDoc) {
      throw new BusinessError(`Serie with ID ${serie} does not exist`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(modelArgs, 'star')) {
    if (!star) throw new BusinessError('star cannot be null');
    const starDoc = await simfinity.getModel('star').findById(star).session(session);
    if (!starDoc) {
      throw new BusinessError(`Star with ID ${star} does not exist`);
    }
  }

  // If we are creating, or updating either of the fields, check for uniqueness.
  if (!args.id || Object.prototype.hasOwnProperty.call(modelArgs, 'serie') || Object.prototype.hasOwnProperty.call(modelArgs, 'star')) {
    // Both IDs must be present to check for uniqueness
    if (serie && star) {
      const existingAssignment = await simfinity.getModel('assignedStarAndSerie').findOne({
        serie,
        star,
        _id: args.id ? { $ne: args.id } : undefined
      }).session(session);

      if (existingAssignment) {
        const starDoc = await simfinity.getModel('star').findById(star).session(session);
        const serieDoc = await simfinity.getModel('serie').findById(serie).session(session);
        throw new BusinessError(`Star "${starDoc.name}" is already assigned to serie "${serieDoc.name}"`);
      }
    }
  }
};

module.exports = {
  validateEpisodeBusinessRules,
  validateEpisodeFields,
  validateStarBusinessRules,
  validateAssignedStarAndSerieBusinessRules
}; 