import SimfinityClient from '@simtlix/simfinity-js-client';
import series from './dataset.js';

const ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';
const SERIE_FIELDS = 'id name director { name country } categories seasons { number year state episodes { number name date } }';

const client = new SimfinityClient(ENDPOINT);

const findOrCreateStar = async (starName) => {
  const existing = await client.find('star')
    .where('name', 'EQ', starName)
    .fields('id')
    .exec();

  if (existing.length > 0) return existing[0].id;

  const created = await client.add('star', { name: starName }, 'id');
  return created.id;
};

(async () => {
  await client.init();
  console.log('Client initialized via introspection.\n');

  for (const serie of series) {
    const { stars, name, categories, director, seasons } = serie;

    const starIds = await Promise.all(stars.map(findOrCreateStar));

    const input = {
      name,
      categories,
      director: { name: director.name, country: director.country },
      stars: {
        added: starIds.map(id => ({ star: { id } })),
      },
      seasons: {
        added: seasons.map(season => ({
          number: season.number,
          year: season.year,
          episodes: {
            added: season.episodes.map(ep => ({
              number: ep.number,
              name: ep.name,
              date: ep.date,
            })),
          },
        })),
      },
    };

    console.log(`Creating serie: ${name}`);
    const result = await client.add('serie', input, SERIE_FIELDS);
    console.log(JSON.stringify(result, null, 2));
    console.log();
  }

  console.log('Dataset loaded successfully.');
})();
