import * as graphql from 'graphql';
import { DateTimeScalar } from 'graphql-date-scalars';
import * as simfinity from '@simtlix/simfinity-js';
import { validateEpisodeNumber, validateDate } from './validators/fieldValidators.js';
import { validateEpisodeBusinessRules, validateEpisodeFields } from './validators/typeValidators.js';

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

export default episodeType;
simfinity.connect(null, episodeType, 'episode', 'episodes');
