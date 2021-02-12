const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');

const { GraphQLObjectType, GraphQLNonNull, GraphQLString } = graphql;

const directorType = new GraphQLObjectType({
  name: 'director',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: GraphQLString }
  })
});

simfinity.addNoEndpointType(directorType);
module.exports = directorType;
