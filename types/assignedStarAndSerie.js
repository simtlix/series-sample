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
      type: new GraphQLNonNull(serieType),
      extensions: {
        relation: {
          embedded: false,
          connectionField: 'serie',
          displayField: 'name'
        }
      },
      resolve(parent) {
        return simfinity.getModel(serieType).findById(parent.serie);
      }
    },
    star: {
      type: new GraphQLNonNull(starType),
      extensions: {
        relation: {
          embedded: false,
          connectionField: 'star',
          displayField: 'name'
        }
      },
      resolve(parent) {
        return simfinity.getModel(starType).findById(parent.star);
      }
    },
  })
});

module.exports = assignedStarAndSerieType;
const serieType = require('./serie');
const starType = require('./star');
simfinity.connect(null, assignedStarAndSerieType, 'assignedStarAndSerie', 'assignedStarsAndSeries');
