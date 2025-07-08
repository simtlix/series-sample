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
      type: new GraphQLNonNull(directorType),
      extensions: {
        relation: {
          embedded: true,
          displayField: 'name'
        }
      }
    },
    stars: {
      type: new GraphQLList(assignedStarAndSerieType),
      extensions: {
        relation: {
          connectionField: 'serie'
        }
      },
      resolve(parent) {
        return simfinity.getModel(assignedStarAndSerieType).find({ serie: parent._id });
      }
    },
    seasons: {
      type: new GraphQLList(seasonType),
      extensions: {
        relation: { connectionField: 'serie' }
      },
      resolve(parent) {
        return simfinity.getModel(seasonType).find({ serie: parent._id });
      }
    }
  })
});

module.exports = serieType;
const seasonType = require('./season');
const directorType = require('./director');
const assignedStarAndSerieType = require('./assignedStarAndSerie');
simfinity.connect(null, serieType, 'serie', 'series', serieController);
