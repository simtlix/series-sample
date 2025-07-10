require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const { ruruHTML } = require('ruru/server');
const graphqljs = require('graphql');
const { envelop, useEngine, useSchema, useErrorHandler } = require('@envelop/core');
const mongoose = require('mongoose');
const simfinity = require('@simtlix/simfinity-js');
const app = express();

// Mongoose connection config
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

let requestCount = 0;

// Envelop plugin for timing
function useTimingPlugin() {
  return {
    onExecute() {
      const start = Date.now();
      const currentCount = ++requestCount;
      return {
        onExecuteDone({ result }) {
          const durationMs = Date.now() - start;
          result.extensions = {
            ...result.extensions,
            runTime: durationMs,
            count: currentCount,
            timestamp: new Date().toISOString()
          };
        }
      };
    }
  };
}

// Setup envelop with proper plugins
const getEnveloped = envelop({
  plugins: [
    useEngine(graphqljs),
    useSchema(schema),
    useErrorHandler(simfinity.buildErrorFormatter((err) => {
      console.log(err);
    })),
    useTimingPlugin()
  ]
});

app.use(cors());

// Serve GraphiQL interface for GET requests
app.get('/graphql', (req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

const handler = createHandler({
  execute: (args) => args.rootValue.execute(args),
  onSubscribe: async (req, params) => {
    const { schema, execute, contextFactory, parse, validate } = getEnveloped({
      req: req.raw,
    });

    const args = {
      schema,
      operationName: params.operationName,
      document: parse(params.query),
      variableValues: params.variables,
      contextValue: await contextFactory(),
      rootValue: {
        execute,
      },
    };

    const errors = validate(args.schema, args.document);
    if (errors.length) return errors;

    return args;
  },
});

// Handle GraphQL operations for POST requests
app.post('/graphql', handler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});