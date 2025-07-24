const graphql = require('graphql');
const { DateTimeScalar } = require('graphql-date-scalars');
const simfinity = require('@simtlix/simfinity-js');
const { validateEpisodeNumber, validateDate } = require('./validators/fieldValidators');
const { validateEpisodeBusinessRules, validateEpisodeFields } = require('./validators/typeValidators');

const { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLNonNull } = graphql;

const episodeType = new GraphQLObjectType({
  name: 'episode',
  extensions: {
    validations: {
      create: [validateEpisodeFields],
      update: [validateEpisodeBusinessRules]
    }
  },
  fields: () => ({
    id: { type: GraphQLID },
    number: { 
      type: GraphQLInt,
      extensions: {
        validations: {
          save: [validateEpisodeNumber],
          update: [validateEpisodeNumber]
        }
      }
    },
    name: { 
      type: GraphQLString,
      extensions: {
        validations: {
          save: [
            async (typeName, fieldName, value, _session) => {
              if (!value || value.trim().length === 0) {
                throw new Error('Episode name cannot be empty');
              }
              if (value.trim().length > 200) {
                throw new Error('Episode name cannot exceed 200 characters');
              }
            }
          ]
        }
      }
    },
    date: { 
      type: DateTimeScalar,
      extensions: {
        validations: {
          save: [validateDate],
          update: [validateDate]
        }
      }
    },
    season: {
      type: new GraphQLNonNull(simfinity.getType('season')),
      extensions: {
        relation: {
          connectionField: 'season',
          displayField: 'number'
        }
      }
    },
  })
});

module.exports = episodeType;
simfinity.connect(null, episodeType, 'episode', 'episodes');
