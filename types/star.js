const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');

const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLID } = graphql;

const startType = new GraphQLObjectType({
  name: 'star',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    series: {
      type: new GraphQLList(serieType),
      extensions: {
        relation: {
          connectionField: 'starID'
        }
      },
      resolve (parent) {
        return simfinity.getModel(serieType).find({ starID: parent._id });
      }
    }
  })
});

module.exports = startType;
const serieType = require('./serie');
simfinity.connect(null, startType, 'star', 'stars');
