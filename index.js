require('dotenv').config();
const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const mongoose = require('mongoose');
const simfinity = require('@simtlix/simfinity-js');
const app = express();

let mongooseConfig = [
  'mongodb://localhost:27017,localhost:27018,localhost:27019/series-sample', 
  {replicaSet: 'rs', useNewUrlParser: true, useUnifiedTopology: true}
];

if(process.env.MONGO) {
  mongooseConfig = [process.env.MONGO, {useNewUrlParser: true, useUnifiedTopology: true}];
}

mongoose.connect(...mongooseConfig).then(() => console.log('Connected to the database')).catch(e => console.log(e));

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
