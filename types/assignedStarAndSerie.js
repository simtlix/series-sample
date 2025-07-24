const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');
const { GraphQLObjectType, GraphQLID, GraphQLNonNull } = graphql;
const { validateAssignedStarAndSerieBusinessRules } = require('./validators/typeValidators');

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

module.exports = assignedStarAndSerieType;
simfinity.connect(null, assignedStarAndSerieType, 'assignedStarAndSerie', 'assignedStarsAndSeries');
