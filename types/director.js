const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = graphql;

const directorType = new GraphQLObjectType({
  name: 'director',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: GraphQLString }
  })
});

module.exports = directorType;
simfinity.connect(null, directorType, 'director', 'directors');
