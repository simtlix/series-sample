const SimfinityError = require('@simtlix/simfinity-js').SimfinityError;

const emptyStringValidator = {
  validate: function (typeName, originalObject) {
    for (let attributeName in originalObject) {
      if (originalObject[attributeName] === '') {
        throw new EmptyStringError(typeName);
      }
    }
  }
};

class EmptyStringError extends SimfinityError {
  constructor(typeName) {
    super(`Can't create a ${typeName} with an empty string`, 'EmptyStringError');
  }
}

module.exports = emptyStringValidator;
