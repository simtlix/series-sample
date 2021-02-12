const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');

const { GraphQLObjectType, GraphQLID } = graphql;

const assignedStarAndSerieType = new GraphQLObjectType({
  name: 'assignedStarAndSerie',
  fields: () => ({
    id: { type: GraphQLID },
    serie: {
      type: serieType,
      extensions: {
        relation: {
          embedded: false,
          connectionField: 'serieID'
        }
      },
      resolve (parent) {
        return simfinity.getModel(serieType).findById(parent.serieID);
      }
    },
    star: {
      type: starType,
      extensions: {
        relation: {
          embedded: false,
          connectionField: 'starID'
        }
      },
      resolve (parent) {
        return simfinity.getModel(starType).findById(parent.starID);
      }
    },
  })
});

module.exports = assignedStarAndSerieType;
const serieType = require('./serie');
const starType = require('./star');
simfinity.connect(null, assignedStarAndSerieType, 'assignedStarAndSerie', 'assignedStarsAndSeries');
