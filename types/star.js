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
      type: new GraphQLList(simfinity.getType('assignedStarAndSerie')),
      extensions: {
        relation: {
          connectionField: 'star'
        }
      }
    }
  })
});

module.exports = starType;
simfinity.connect(null, starType, 'star', 'stars');
