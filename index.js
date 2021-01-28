const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const mongoose = require('mongoose');
const simfinity = require('@simtlix/simfinity-js');

const app = express();

mongoose.connect(
  'mongodb+srv://escavuzzo:Simtlix01@simfinity.68i54.mongodb.net/series-sample?retryWrites=true&w=majority',
  {useNewUrlParser: true, useUnifiedTopology: true},
).then(() => console.log('Connected to the database')).catch(e => console.log(e));

require('./types/serie');
const schema = simfinity.createSchema();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
  customFormatErrorFn: simfinity.buildErrorFormatter((err) => {
    console.log(err);
  }),
}));

app.listen(3000, () => {
  console.log('Listening on port 3000');
});