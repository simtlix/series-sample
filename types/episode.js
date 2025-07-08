const graphql = require('graphql');
const GraphQLDateTime = require('graphql-iso-date').GraphQLDateTime;
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
      type: GraphQLDateTime,
      extensions: {
        validations: {
          save: [validateDate],
          update: [validateDate]
        }
      }
    },
    season: {
      type: new GraphQLNonNull(seasonType),
      extensions: {
        relation: {
          connectionField: 'season',
          displayField: 'number'
        }
      },
      resolve(parent) {
        return simfinity.getModel(seasonType).findById(parent.season);
      }
    },
  })
});

module.exports = episodeType;
const seasonType = require('./season');
simfinity.connect(null, episodeType, 'episode', 'episodes');
