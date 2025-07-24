import * as graphql from 'graphql';
import * as simfinity from '@simtlix/simfinity-js';
const { GraphQLObjectType, GraphQLID, GraphQLNonNull } = graphql;
import { validateAssignedStarAndSerieBusinessRules } from './validators/typeValidators.js';

const assignedStarAndSerieType = new GraphQLObjectType({
  name: 'assignedStarAndSerie',
  extensions: {
    validations: {
      create: [validateAssignedStarAndSerieBusinessRules],
      update: [validateAssignedStarAndSerieBusinessRules]
    }
  },
  fields: () => ({
    id: { type: GraphQLID },
    serie: {
      type: new GraphQLNonNull(simfinity.getType('serie')),
      extensions: {
        relation: {
          embedded: false,
          connectionField: 'serie',
          displayField: 'name'
        }
      }
    },
    star: {
      type: new GraphQLNonNull(simfinity.getType('star')),
      extensions: {
        relation: {
          embedded: false,
          connectionField: 'star',
          displayField: 'name'
        }
      }
    },
  })
});

export default assignedStarAndSerieType;
simfinity.connect(null, assignedStarAndSerieType, 'assignedStarAndSerie', 'assignedStarsAndSeries');
