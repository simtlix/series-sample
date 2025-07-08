const graphql = require('graphql');
const simfinity = require('@simtlix/simfinity-js');
const { validateName, validateUniqueStarName } = require('./validators/fieldValidators');
const { validateStarBusinessRules } = require('./validators/typeValidators');

const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLID } = graphql;

const starType = new GraphQLObjectType({
  name: 'star',
  extensions: {
    validations: {
      create: [validateStarBusinessRules],
      update: [validateStarBusinessRules]
    }
  },
  fields: () => ({
    id: { type: GraphQLID },
    name: {
      type: GraphQLString,
      extensions: { 
        unique: true,
        validations: {
          save: [validateName, validateUniqueStarName],
          update: [validateName, validateUniqueStarName]
        }
      }
    },
    series: {
      type: new GraphQLList(assignedStarAndSerieType),
      extensions: {
        relation: {
          connectionField: 'star'
        }
      },
      resolve(parent) {
        return simfinity.getModel(assignedStarAndSerieType).find({ star: parent._id });
      }
    }
  })
});

module.exports = starType;
const assignedStarAndSerieType = require('./assignedStarAndSerie');
simfinity.connect(null, starType, 'star', 'stars');
