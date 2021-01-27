const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');

const { GraphQLObjectType, GraphQLID, GraphQLInt, GraphQLEnumType, GraphQLList } = graphql;

const seasonState = new GraphQLEnumType({
  name: 'seasonState',
  values: {
    SCHEDULED: { value: 'SCHEDULED' },
    ACTIVE: { value: 'ACTIVE' },
    FINISHED: { value: 'FINISHED' }
  }
});

const seasonType = new GraphQLObjectType({
  name: 'season',
  fields: () => ({
    id: { type: GraphQLID },
    number: { type: GraphQLInt },
    year: { type: GraphQLInt },
    state: { type: seasonState }, 
    serie: {
      type: serieType,
      extensions: {
        relation: {
          connectionField: 'serieID'
        }
      },
      resolve (parent) {
        return simfinity.getModel(serieType).findById(parent.serieID);
      }
    },
    episodes: {
      type: new GraphQLList(episodeType),
      extensions: {
        relation: {
          connectionField: 'seasonID'
        }
      },
      resolve (parent) {
        return simfinity.getModel(episodeType).find({ seasonID: parent._id });
      }
    }
  })
});

module.exports = seasonType;
const serieType = require('./serie');
const episodeType = require('./episode');

const stateMachine = {
  initialState: seasonState._nameLookup.SCHEDULED,
  actions: {
    activate: {
      from: seasonState._nameLookup.SCHEDULED,
      to: seasonState._nameLookup.ACTIVE,
      action: async (params) => {
        console.log(JSON.stringify(params));
      }
    },
    finalize: {
      from: seasonState._nameLookup.ACTIVE,
      to: seasonState._nameLookup.FINISHED,
      action: async (params) => {
        console.log(JSON.stringify(params));
      }
    }
  }
};

simfinity.connect(null, seasonType, 'season', 'seasons', null, null, stateMachine);
