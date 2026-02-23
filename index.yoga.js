import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createYoga } from 'graphql-yoga';
import * as simfinity from '@simtlix/simfinity-js';
import { useErrorHandler } from '@envelop/core';

// ------------------------
// Conexión a MongoDB
// ------------------------
let mongooseConfig = [
  'mongodb://localhost:27017,localhost:27018,localhost:27019/series-sample',
  { replicaSet: 'rs' }
];

if (process.env.MONGO) {
  mongooseConfig = [process.env.MONGO, {}];
}

mongoose
  .connect(...mongooseConfig)
  .then(() => console.log('Connected to the database'))
  .catch((e) => console.error(e));

// ------------------------
// Cargar tipos Simfinity
// ------------------------
import './types/index.js';

// Construir schema desde Simfinity
const schema = simfinity.createSchema();

// ------------------------
// Auth Plugin Configuration
// ------------------------
const { createAuthPlugin, requireRole } = simfinity.auth;

const permissions = {
  Mutation: {
    deletestar: requireRole('admin'),
  },
};

const authPlugin = createAuthPlugin(permissions, { defaultPolicy: 'ALLOW', debug: true });

// ------------------------
// Plugins Envelop (solo los necesarios)
// ------------------------
function useTimingPlugin() {
  return {
    onExecute() {
      const start = Date.now();
      return {
        onExecuteDone({ result }) {
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

// ------------------------
// Servidor Express + Yoga
// ------------------------
const app = express();
app.use(cors());

const yoga = createYoga({
  schema,
  context: () => ({
    user: {
      id: '1',
      name: 'Admin User',
      role: 'admin',
    },
  }),
  plugins: [
    useErrorHandler(
      simfinity.buildErrorFormatter((err) => {
        console.error(err);
      })
    ),
    useTimingPlugin(),
    useCountPlugin(),
    authPlugin
  ],
  graphiql: true,
  graphqlEndpoint: '/graphql',
  maskedErrors: false
});

app.use('/graphql', yoga);

// ------------------------
// Arrancar servidor
// ------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});