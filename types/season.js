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
      type: simfinity.getType('serie'),
      extensions: {
        relation: {
          connectionField: 'serie',
          displayField: 'name'
        }
      }
    },
    episodes: {
      type: new GraphQLList(simfinity.getType('episode')),
      extensions: {
        relation: {
          connectionField: 'season'
        }
      }
    }
  })
});

module.exports = seasonType;

const stateMachine = {
  initialState: seasonState.getValue('SCHEDULED'),
  actions: {
    activate: {
      from: seasonState.getValue('SCHEDULED'),
      to: seasonState.getValue('ACTIVE'),
      action: async (params) => {
        console.log(JSON.stringify(params));
      }
    },
    finalize: {
      from: seasonState.getValue('ACTIVE'),
      to: seasonState.getValue('FINISHED'),
      action: async (params) => {
        console.log(JSON.stringify(params));
      }
    }
  }
};

simfinity.connect(null, seasonType, 'season', 'seasons', null, null, stateMachine);