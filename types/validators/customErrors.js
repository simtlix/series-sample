const { SimfinityError } = require('@simtlix/simfinity-js');

// Validation Errors
class ValidationError extends SimfinityError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

// Business Logic Errors
class BusinessError extends SimfinityError {
  constructor(message) {
    super(message, 'BUSINESS_ERROR', 400);
  }
}

// Authorization Errors
class AuthorizationError extends SimfinityError {
  constructor(message) {
    super(message, 'UNAUTHORIZED', 401);
  }
}

// Not Found Errors
class NotFoundError extends SimfinityError {
  constructor(message) {
    super(message, 'NOT_FOUND', 404);
  }
}

// Conflict Errors
class ConflictError extends SimfinityError {
  constructor(message) {
    super(message, 'CONFLICT', 409);
  }
}

// Series-specific errors
class SerieNotFoundError extends NotFoundError {
  constructor(serieId) {
    super(`Serie with ID ${serieId} not found`);
  }
}

class SeasonNotFoundError extends NotFoundError {
  constructor(seasonId) {
    super(`Season with ID ${seasonId} not found`);
  }
}

class EpisodeNotFoundError extends NotFoundError {
  constructor(episodeId) {
    super(`Episode with ID ${episodeId} not found`);
  }
}

class StarNotFoundError extends NotFoundError {
  constructor(starId) {
    super(`Star with ID ${starId} not found`);
  }
}

class DirectorNotFoundError extends NotFoundError {
  constructor(directorId) {
    super(`Director with ID ${directorId} not found`);
  }
}

module.exports = {
  ValidationError,
  BusinessError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  SerieNotFoundError,
  SeasonNotFoundError,
  EpisodeNotFoundError,
  StarNotFoundError,
  DirectorNotFoundError
}; 