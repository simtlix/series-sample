import SimfinityClient from '@simtlix/simfinity-js-client';

const ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';

const client = new SimfinityClient(ENDPOINT);

const PAGE_SIZE = 500;

const deleteAllOfType = async (typeName) => {
  let totalDeleted = 0;
  let batch;

  do {
    try {
      batch = await client.find(typeName).fields('id').page(1, PAGE_SIZE).exec();
    } catch (e) {
      console.error(`Error fetching ${typeName}: ${e.message}`);
      return;
    }

    for (const item of batch) {
      try {
        await client.delete(typeName, item.id, 'id');
        totalDeleted++;
      } catch (e) {
        console.error(`  Error deleting ${typeName} ${item.id}: ${e.message}`);
      }
    }
  } while (batch.length > 0);

  if (totalDeleted === 0) {
    console.log(`No ${typeName} to delete.`);
  } else {
    console.log(`Deleted ${totalDeleted} ${typeName}(s).`);
  }
};

(async () => {
  await client.init();
  console.log('Client initialized via introspection.\n');
  console.log('Starting dataset deletion...');

  await deleteAllOfType('assignedStarAndSerie');
  await deleteAllOfType('episode');
  await deleteAllOfType('season');
  await deleteAllOfType('serie');
  await deleteAllOfType('star');

  console.log('\nDataset deletion complete.');
})();
