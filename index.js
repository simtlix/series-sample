require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
mongoose.set('useCreateIndex', true);

require('./types/serie');
const schema = simfinity.createSchema();

app.use(cors());
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
  customFormatErrorFn: simfinity.buildErrorFormatter((err) => {
    console.log(err);
  }),
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
