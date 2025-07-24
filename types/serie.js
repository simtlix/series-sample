const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');
const { validateName, validateCategories, validateUniqueSerieName } = require('./validators/fieldValidators');
const serieController = require('./controllers/serieController');

const { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLID, GraphQLList } = graphql;

const serieType = new GraphQLObjectType({
  name: 'serie',
  fields: () => ({
    id: { type: GraphQLID },
    name: { 
      type: new GraphQLNonNull(GraphQLString),
      extensions: {
        validations: {
          save: [validateName, validateUniqueSerieName],
          update: [validateName, validateUniqueSerieName]
        }
      }
    },
    categories: { 
      type: new GraphQLList(GraphQLString),
      extensions: {
        validations: {
          save: [validateCategories],
          update: [validateCategories]
        }
      }
    },
    director: {
      type: new GraphQLNonNull(simfinity.getType('director')),
      extensions: {
        relation: {
          embedded: true,
          displayField: 'name'
        }
      }
    },
    stars: {
      type: new GraphQLList(simfinity.getType('assignedStarAndSerie')),
      extensions: {
        relation: {
          connectionField: 'serie'
        }
      }
    },
    seasons: {
      type: new GraphQLList(simfinity.getType('season')),
      extensions: {
        relation: { connectionField: 'serie' }
      }
    }
  })
});

module.exports = serieType;


simfinity.connect(null, serieType, 'serie', 'series', serieController);
