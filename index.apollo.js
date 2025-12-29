// server-apollo.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import * as simfinity from '@simtlix/simfinity-js';

// ---------- Mongo ----------
let mongooseConfig = [
  'mongodb://localhost:27017,localhost:27018,localhost:27019/series-sample',
  { replicaSet: 'rs' }
];
if (process.env.MONGO) {
  mongooseConfig = [process.env.MONGO, {}];
}
await mongoose.connect(...mongooseConfig).then(() => console.log('Connected to the database')).catch(console.error);

// ---------- Simfinity schema ----------
import './types/index.js';
const schema = simfinity.createSchema();
const formatError = simfinity.buildErrorFormatter((err) => { console.error(err); });

// ------------------------
// Apollo plugins
// ------------------------
function timingPlugin() {
  return {
    async requestDidStart() {
      const start = Date.now();
      return {
        async willSendResponse({ response }) {
          const durationMs = Date.now() - start;
          if (response.body.kind === 'single') {
            response.body.singleResult.extensions = {
              ...(response.body.singleResult.extensions || {}),
              runTime: durationMs,
              timestamp: new Date().toISOString(),
            };
          }
        }
      };
    }
  };
};

// Using simfinity's Apollo count plugin
const countPlugin = simfinity.plugins.apolloCountPlugin;



// ---------- Apollo ----------
const server = new ApolloServer({
  schema,
  formatError,
  plugins: [ApolloServerPluginLandingPageLocalDefault({ includeCookies: false }), timingPlugin(), countPlugin()],
});
await server.start();

// ---------- Express ----------
const app = express();
app.use(cors());

// GET /graphql -> serve Apollo landing page / Playground
app.get('/graphql', express.json(), expressMiddleware(server, { context: async () => ({}) }));

// POST /graphql -> JSON body required
app.post(
  '/graphql',
  express.json({ limit: '1mb', type: ['application/json', 'application/*+json'] }),
  expressMiddleware(server, { context: async () => ({}) })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  console.log(`Playground: http://localhost:${PORT}/graphql`);
});