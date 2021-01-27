const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');

const { GraphQLObjectType, GraphQLString } = graphql;

const directorType = new GraphQLObjectType({
  name: 'director',
  fields: () => ({
    name: { type: GraphQLString },
    country: { type: GraphQLString }
  })
});

simfinity.addNoEndpointType(directorType);
module.exports = directorType;
