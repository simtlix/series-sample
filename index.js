const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const mongoose = require('mongoose');
const simfinity = require('@simtlix/simfinity-js');

const app = express();

mongoose.connect(
  'mongodb://localhost:27017,localhost:27018,localhost:27019/series-sample',
  {replicaSet: 'rs', useNewUrlParser: true, useUnifiedTopology: true},
).then(() => console.log('Connected to the database'));

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
