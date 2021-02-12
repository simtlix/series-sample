const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');

const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLID } = graphql;

const startType = new GraphQLObjectType({
  name: 'star',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    series: {
      type: new GraphQLList(assignedStarAndSerieType),
      extensions: {
        relation: {
          connectionField: 'starID'
        }
      },
      resolve (parent) {
        return simfinity.getModel(assignedStarAndSerieType).find({ starID: parent._id });
      }
    }
  })
});

module.exports = startType;
const assignedStarAndSerieType = require('./assignedStarAndSerie');
simfinity.connect(null, startType, 'star', 'stars');
