import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import { ruruHTML } from 'ruru/server';
import * as graphqljs from 'graphql';
import { envelop, useEngine, useSchema, useErrorHandler } from '@envelop/core';
import mongoose from 'mongoose';
import * as simfinity from '@simtlix/simfinity-js';
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

// Load all types through centralized index
import './types/index.js';

const schema = simfinity.createSchema();


// Envelop plugin for timing
function useTimingPlugin() {
  return {
    onExecute() {
      const start = Date.now();
      return {
        onExecuteDone({result}) {
          const durationMs = Date.now() - start;
          result.extensions = {
            ...result.extensions,
            runTime: durationMs,
            timestamp: new Date().toISOString()
          };
        }
      };
    }
  };
}

// Using simfinity's count plugin
const useCountPlugin = simfinity.plugins.envelopCountPlugin;

// Setup envelop with proper plugins
const getEnveloped = envelop({
  plugins: [
    useEngine(graphqljs),
    useSchema(schema),
    useErrorHandler(simfinity.buildErrorFormatter((err) => {
      console.log(err);
    })),
    useTimingPlugin(),
    useCountPlugin(),
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