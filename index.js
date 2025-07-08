require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const mongoose = require('mongoose');
const simfinity = require('@simtlix/simfinity-js');
const app = express();

let mongooseConfig = [
  'mongodb://localhost:27017,localhost:27018,localhost:27019/series-sample',
  { replicaSet: 'rs' }
];

if (process.env.MONGO) {
  mongooseConfig = [process.env.MONGO, {}];
}

mongoose.connect(...mongooseConfig)
  .then(() => console.log('Connected to the database'))
  .catch(e => console.log(e));

require('./types/serie');
const schema = simfinity.createSchema();

const extensions = (param) => {
  return {
    runTime: Date.now() - param.context.startTime,
    count: param.context.count,
  };
};

app.use(cors());

app.use(
  '/graphql',
  createHandler({
    schema: schema,
    context: () => ({ startTime: Date.now() }),
    formatError: simfinity.buildErrorFormatter((err) => {
      console.log(err);
    }),
  }),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
