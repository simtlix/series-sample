const graphql = require('graphql');
const GraphQLDateTime = require('graphql-iso-date').GraphQLDateTime;
const simfinity = require('@simtlix/simfinity-js');

const { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLInt } = graphql;

const episodeType = new GraphQLObjectType({
  name: 'episode',
  fields: () => ({
    id: { type: GraphQLID },
    number: { type: GraphQLInt },
    name: { type: GraphQLString },
    date: { type: GraphQLDateTime },
    season: {
      type: seasonType,
      extensions: {
        relation: {
          connectionField: 'seasonID',
          displayField: 'number'
        }
      },
      resolve(parent) {
        return simfinity.getModel(seasonType).findById(parent.seasonID);
      }
    },
  })
});

module.exports = episodeType;
const seasonType = require('./season');
simfinity.connect(null, episodeType, 'episode', 'episodes');
