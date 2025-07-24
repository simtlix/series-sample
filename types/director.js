import * as graphql from 'graphql';
import * as simfinity from '@simtlix/simfinity-js';
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = graphql;

const directorType = new GraphQLObjectType({
  name: 'director',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: GraphQLString }
  })
});

export default directorType;

// NOTE: Director type uses addNoEndpointType() instead of connect() because it's designed to be 
// embedded within other types (like Serie) rather than having its own collection/endpoint.
// This adds the type to the GraphQL schema without generating CRUD endpoints.
// See serie.js where director is marked as: embedded: true
simfinity.addNoEndpointType(directorType);
