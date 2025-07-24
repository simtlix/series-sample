import * as graphql from 'graphql';
import * as simfinity from '@simtlix/simfinity-js';
import { validateName, validateUniqueStarName } from './validators/fieldValidators.js';
import { validateStarBusinessRules } from './validators/typeValidators.js';

const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLID } = graphql;

const starType = new GraphQLObjectType({
  name: 'star',
  extensions: {
    validations: {
      create: [validateStarBusinessRules],
      update: [validateStarBusinessRules]
    }
  },
  fields: () => ({
    id: { type: GraphQLID },
    name: {
      type: GraphQLString,
      extensions: { 
        unique: true,
        validations: {
          save: [validateName, validateUniqueStarName],
          update: [validateName, validateUniqueStarName]
        }
      }
    },
    series: {
      type: new GraphQLList(simfinity.getType('assignedStarAndSerie')),
      extensions: {
        relation: {
          connectionField: 'star'
        }
      }
    }
  })
});

export default starType;
simfinity.connect(null, starType, 'star', 'stars');
