const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');

const { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLID, GraphQLList } = graphql;

const serieType = new GraphQLObjectType({
  name: 'serie',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    categories: { type: new GraphQLList(GraphQLString) },
    director: {
      type: directorType,
      extensions: {
        relation: {
          embedded: true,
          displayField: 'name'
        }
      }
    },
    stars: {
      type: new GraphQLList(assignedStarAndSerieType),
      extensions: {
        relation: {
          connectionField: 'serieID'
        }
      },
      resolve(parent) {
        return simfinity.getModel(assignedStarAndSerieType).find({ serieID: parent._id });
      }
    },
    seasons: {
      type: new GraphQLList(seasonType),
      extensions: {
        relation: { connectionField: 'serieID' }
      },
      resolve(parent) {
        return simfinity.getModel(seasonType).find({ serieID: parent._id });
      }
    }
  })
});

module.exports = serieType;
const seasonType = require('./season');
const directorType = require('./director');
const assignedStarAndSerieType = require('./assignedStarAndSerie');
simfinity.connect(null, serieType, 'serie', 'series');
