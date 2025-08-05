import * as graphql from 'graphql';
import * as simfinity from '@simtlix/simfinity-js';
import { ValidationError } from './validators/customErrors.js';

const { GraphQLString, GraphQLInt } = graphql;

// Episode Name Validated Scalar
export const EpisodeNameScalar = simfinity.createValidatedScalar(
  'EpisodeName',
  'A validated episode name scalar that ensures proper formatting and length',
  GraphQLString,
  (value) => {
    return value;
  }
);

// Season Number Validated Scalar
export const SeasonNumberScalar = simfinity.createValidatedScalar(
  'SeasonNumber',
  'A validated season number scalar that ensures proper range',
  GraphQLInt,
  (value) => {
    if (value === null || value === undefined) {
      return value;
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      throw new ValidationError('Season number must be a valid number');
    }
    
    if (numValue <= 0) {
      throw new ValidationError('Season number must be a positive number');
    }
    
    if (numValue > 50) {
      throw new ValidationError('Season number cannot exceed 50');
    }
    
    return numValue;
  }
);

// Episode Number Validated Scalar
export const EpisodeNumberScalar = simfinity.createValidatedScalar(
  'EpisodeNumber',
  'A validated episode number scalar that ensures proper range',
  GraphQLInt,
  (value) => {
    if (value === null || value === undefined) {
      return value;
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      throw new ValidationError('Episode number must be a valid number');
    }
    
    if (numValue <= 0) {
      throw new ValidationError('Episode number must be a positive number');
    }
    
    if (numValue > 999) {
      throw new ValidationError('Episode number cannot exceed 999');
    }
    
    return numValue;
  }
); 