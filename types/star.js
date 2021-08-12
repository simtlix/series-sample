const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');
const emptyStringValidator = require('./validators/emptyStringValidator');

const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLID } = graphql;

const startType = new GraphQLObjectType({
  name: 'star',
  extensions: { validations: { 'CREATE': [emptyStringValidator] } },
  fields: () => ({
    id: { type: GraphQLID },
    name: {
      type: GraphQLString,
      extensions: { unique: true }
    },
    series: {
      type: new GraphQLList(assignedStarAndSerieType),
      extensions: {
        relation: {
          connectionField: 'starID'
        }
      },
      resolve(parent) {
        return simfinity.getModel(assignedStarAndSerieType).find({ starID: parent._id });
      }
    }
  })
});

module.exports = startType;
const assignedStarAndSerieType = require('./assignedStarAndSerie');
simfinity.connect(null, startType, 'star', 'stars');
