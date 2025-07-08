const { ValidationError } = require('./customErrors');

// Name validators
const validateName = async (_typeName, fieldName, value, _session) => {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
  if (value.trim().length < 2) {
    throw new ValidationError(`${fieldName} must be at least 2 characters long`);
  }
  if (value.trim().length > 100) {
    throw new ValidationError(`${fieldName} cannot exceed 100 characters`);
  }
};

// Number validators
const validatePositiveNumber = async (_typeName, fieldName, value, _session) => {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'number' || value <= 0) {
      throw new ValidationError(`${fieldName} must be a positive number`);
    }
  }
};

const validateEpisodeNumber = async (_typeName, _fieldName, value, _session) => {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'number' || value <= 0) {
      throw new ValidationError('Episode number must be a positive number');
    }
    if (value > 999) {
      throw new ValidationError('Episode number cannot exceed 999');
    }
  }
};

const validateSeasonNumber = async (_typeName, _fieldName, value, _session) => {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'number' || value <= 0) {
      throw new ValidationError('Season number must be a positive number');
    }
    if (value > 50) {
      throw new ValidationError('Season number cannot exceed 50');
    }
  }
};

const validateYear = async (_typeName, _fieldName, value, _session) => {
  if (value !== undefined && value !== null) {
    const currentYear = new Date().getFullYear();
    if (typeof value !== 'number' || value < 1900 || value > currentYear + 10) {
      throw new ValidationError(`Year must be between 1900 and ${currentYear + 10}`);
    }
  }
};

// Date validators
const validateDate = async (_typeName, fieldName, value, _session) => {
  if (value !== undefined && value !== null) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`${fieldName} must be a valid date`);
    }
    const currentDate = new Date();
    if (date > currentDate) {
      throw new ValidationError(`${fieldName} cannot be in the future`);
    }
  }
};

// Categories validators
const validateCategories = async (_typeName, _fieldName, value, _session) => {
  if (value && Array.isArray(value)) {
    if (value.length === 0) {
      throw new ValidationError('Categories cannot be empty array');
    }
    if (value.length > 10) {
      throw new ValidationError('Cannot have more than 10 categories');
    }
    for (const category of value) {
      if (!category || category.trim().length === 0) {
        throw new ValidationError('Category cannot be empty');
      }
      if (category.trim().length > 50) {
        throw new ValidationError('Category name cannot exceed 50 characters');
      }
    }
  }
};

// Country validators
const validateCountry = async (_typeName, _fieldName, value, _session) => {
  if (value !== undefined && value !== null) {
    if (value.trim().length === 0) {
      throw new ValidationError('Country cannot be empty');
    }
    if (value.trim().length > 100) {
      throw new ValidationError('Country name cannot exceed 100 characters');
    }
  }
};

// Unique name validator (for stars)
const validateUniqueStarName = async (typeName, fieldName, value, session, args) => {
  if (value) {
    const simfinity = require('@simtlix/simfinity-js');
    const starModel = simfinity.getModel('star');

    const existingStar = await starModel.findOne({
      name: value,
      _id: args.id ? { $ne: args.id } : undefined
    }).session(session);

    if (existingStar) {
      throw new ValidationError(`A star with the name "${value}" already exists`);
    }
  }
};

// Unique serie name validator
const validateUniqueSerieName = async (typeName, fieldName, value, session, args) => {
  if (value) {
    const simfinity = require('@simtlix/simfinity-js');
    const serieModel = simfinity.getModel('serie');

    const existingSerie = await serieModel.findOne({
      name: value,
      _id: args.id ? { $ne: args.id } : undefined
    }).session(session);

    if (existingSerie) {
      throw new ValidationError(`A serie with the name "${value}" already exists`);
    }
  }
};

module.exports = {
  validateName,
  validatePositiveNumber,
  validateEpisodeNumber,
  validateSeasonNumber,
  validateYear,
  validateDate,
  validateCategories,
  validateCountry,
  validateUniqueStarName,
  validateUniqueSerieName
}; 