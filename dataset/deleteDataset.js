const fetch = require('node-fetch');

const sendRequest = async (body) => {
  const response = await fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: body,
    })
  });
  return response.json();
};

const deleteAllOfType = async (pluralName, mutationName) => {
  console.log(`Fetching all ${pluralName}...`);
  const query = `{ ${pluralName} { id } }`;
  let response;
  try {
    response = await sendRequest(query);
  } catch (e) {
    console.error('Error connecting to GraphQL endpoint at http://localhost:3000/graphql. Is the server running?', e.message);
    return;
  }


  if (response.errors) {
    console.error(`GraphQL error fetching ${pluralName}:`, JSON.stringify(response.errors, null, 2));
    return;
  }

  if (!response.data || !response.data[pluralName]) {
    console.log(`Could not fetch ${pluralName} or none exist.`);
    return;
  }

  const items = response.data[pluralName];
  if (items.length === 0) {
    console.log(`No ${pluralName} to delete.`);
    return;
  }

  console.log(`Deleting ${items.length} ${pluralName}...`);

  for (const item of items) {
    const mutation = `mutation { ${mutationName}(id: "${item.id}") { id } }`;
    const deleteResponse = await sendRequest(mutation);
    if (deleteResponse.errors) {
      console.error(`Error deleting ${pluralName} with id ${item.id}:`, JSON.stringify(deleteResponse.errors, null, 2));
    }
  }
    
  console.log(`Successfully deleted ${items.length} ${pluralName}.`);

};

(async () => {
  console.log('Starting dataset deletion...');
  // The order is important to respect dependencies!
  await deleteAllOfType('assignedStarsAndSeries', 'deleteassignedStarAndSerie');
  await deleteAllOfType('episodes', 'deleteepisode');
  await deleteAllOfType('seasons', 'deleteseason');
  await deleteAllOfType('series', 'deleteserie');
  await deleteAllOfType('stars', 'deletestar');
  console.log('Dataset deletion complete.');
})(); 