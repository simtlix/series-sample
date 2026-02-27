import SimfinityClient from '../client/SimfinityClient.js';

const ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';

const client = new SimfinityClient(ENDPOINT);

const deleteAllOfType = async (typeName) => {
  let items;
  try {
    items = await client.find(typeName).fields('id').exec();
  } catch (e) {
    console.error(`Error fetching ${typeName}: ${e.message}`);
    return;
  }

  if (items.length === 0) {
    console.log(`No ${typeName} to delete.`);
    return;
  }

  console.log(`Deleting ${items.length} ${typeName}(s)...`);
  for (const item of items) {
    try {
      await client.delete(typeName, item.id, 'id');
    } catch (e) {
      console.error(`  Error deleting ${typeName} ${item.id}: ${e.message}`);
    }
  }
  console.log('  Done.');
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
