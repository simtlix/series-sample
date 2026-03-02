import fetch from 'node-fetch';

const ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';

const gql = async (query, variables) => {
  const body = { query };
  if (variables) body.variables = variables;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

const hr = () => console.log('-'.repeat(70));

(async () => {
  console.log('=== Debug: 2-Level Nested Creation (serie -> season -> episode) ===\n');

  // -----------------------------------------------------------------------
  // Step 1: Create a serie with 1 season containing 2 episodes (nested)
  // -----------------------------------------------------------------------
  const mutation = `
    mutation($input: serieInput!) {
      addserie(input: $input) {
        id
        name
        seasons {
          id
          number
          year
          episodes {
            id
            number
            name
          }
        }
      }
    }
  `;

  const input = {
    name: `DebugSerie_${Date.now()}`,
    categories: ['Debug'],
    director: { name: 'Debug Director', country: 'Testland' },
    seasons: {
      added: [
        {
          number: 1,
          year: 2025,
          episodes: {
            added: [
              { number: 1, name: 'Nested Pilot', date: '2025-01-01T00:00:00.000Z' },
              { number: 2, name: 'Nested Second', date: '2025-01-08T00:00:00.000Z' },
            ],
          },
        },
      ],
    },
  };

  hr();
  console.log('STEP 1: Creating serie with nested season + episodes');
  console.log('Input:', JSON.stringify(input, null, 2));
  hr();

  const createResult = await gql(mutation, { input });

  if (createResult.errors) {
    console.log('Mutation errors:', JSON.stringify(createResult.errors, null, 2));
  }

  const serie = createResult.data?.addserie;
  if (!serie) {
    console.log('Serie creation returned null. Full response:', JSON.stringify(createResult, null, 2));
    process.exit(1);
  }

  console.log('\nCreated serie:', JSON.stringify(serie, null, 2));

  const season = serie.seasons?.[0];
  const episodesFromResponse = season?.episodes;

  console.log(`\nSerie ID:  ${serie.id}`);
  console.log(`Season ID: ${season?.id ?? 'MISSING'}`);
  console.log(`Episodes returned in addserie response: ${episodesFromResponse?.length ?? 0}`);
  if (episodesFromResponse) {
    episodesFromResponse.forEach(ep => console.log(`  Episode ${ep.number}: ${ep.name} (id: ${ep.id})`));
  }

  // -----------------------------------------------------------------------
  // Step 2: Query the NESTED episodes by name to check season back-reference
  // -----------------------------------------------------------------------
  hr();
  console.log('\nSTEP 2: Query nested episodes by name (requesting season field)');
  hr();

  const nestedEpIds = episodesFromResponse?.map(ep => ep.id) ?? [];

  for (const epId of nestedEpIds) {
    const epResult = await gql(`{ episode(id: "${epId}") { id number name season { id number } } }`);
    if (epResult.errors) {
      console.log(`  Episode ${epId}: ERROR - ${epResult.errors[0].message}`);
    } else {
      const ep = epResult.data?.episode;
      if (ep) {
        console.log(`  Episode ${ep.number} "${ep.name}": season = ${ep.season ? `{ id: ${ep.season.id}, number: ${ep.season.number} }` : 'NULL <<<< BUG'}`);
      } else {
        console.log(`  Episode ${epId}: null (season NonNull constraint caused nullification)`);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Step 3: Query nested episodes WITHOUT season field (to confirm they exist)
  // -----------------------------------------------------------------------
  hr();
  console.log('\nSTEP 3: Query nested episodes without season field (confirm they exist)');
  hr();

  const episodeIds = [];
  for (const epId of nestedEpIds) {
    const epResult = await gql(`{ episode(id: "${epId}") { id number name } }`);
    const ep = epResult.data?.episode;
    if (ep) {
      episodeIds.push(ep);
      console.log(`  id: ${ep.id}, number: ${ep.number}, name: "${ep.name}" - EXISTS`);
    } else {
      console.log(`  id: ${epId} - NOT FOUND`);
    }
  }

  // -----------------------------------------------------------------------
  // Step 4: Verify season via the serie -> seasons -> episodes path
  // -----------------------------------------------------------------------
  hr();
  console.log('\nSTEP 4: Query the serie and walk serie -> seasons -> episodes path');
  hr();

  const serieCheck = await gql(`{
    serie(id: "${serie.id}") {
      id name
      seasons { id number episodes { id number name season { id } } }
    }
  }`);

  if (serieCheck.errors) {
    console.log('Errors querying serie path:', serieCheck.errors.map(e => `${e.path?.join('.')}: ${e.message}`));
  }

  const checkedSerie = serieCheck.data?.serie;
  if (checkedSerie?.seasons) {
    for (const s of checkedSerie.seasons) {
      console.log(`  Season ${s.number} (${s.id}):`);
      if (s.episodes) {
        for (const ep of s.episodes) {
          if (ep) {
            console.log(`    Episode ${ep.number} "${ep.name}": season ref = ${ep.season?.id ?? 'NULL <<<< BUG'}`);
          } else {
            console.log('    Episode: null (NonNull season was null)');
          }
        }
      } else {
        console.log('    No episodes returned');
      }
    }
  }

  // -----------------------------------------------------------------------
  // Step 5: Compare with a non-nested episode creation
  // -----------------------------------------------------------------------
  hr();
  console.log('\nSTEP 5: Create an episode directly with explicit season reference (control test)');
  hr();

  let directEp = null;

  if (season?.id) {
    const directEpResult = await gql(
      `mutation($input: episodeInput!) { addepisode(input: $input) { id name } }`,
      { input: { number: 99, name: 'Direct Episode', date: '2025-06-01T00:00:00.000Z', season: { id: season.id } } },
    );

    if (directEpResult.errors) {
      console.log('Direct episode creation errors:', directEpResult.errors.map(e => e.message));
    }

    directEp = directEpResult.data?.addepisode;
    if (directEp) {
      console.log(`Created direct episode: ${directEp.id}`);

      const directCheck = await gql(`{ episode(id: "${directEp.id}") { id name season { id number } } }`);
      if (directCheck.errors) {
        console.log(`  season check: ERROR - ${directCheck.errors[0].message}`);
      } else {
        const s = directCheck.data?.episode?.season;
        console.log(`  season check: ${s ? `season.id=${s.id}, number=${s.number}` : 'NULL'}`);
      }
    }
  } else {
    console.log('Skipped (no season ID available)');
  }

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  hr();
  console.log('\n=== SUMMARY ===');
  console.log('If nested episodes show season=NULL but direct episode shows season=OK,');
  console.log('the bug is in the framework\'s iterateonCollectionFields / executeItemFunction');
  console.log('when processing 2nd-level nested collections.');
  console.log('\nKey areas to add console.log in simfinity.js/src/index.js:');
  console.log('  - Line ~586: after linkToParent(modelArgs) -> log modelArgs');
  console.log('  - Line ~732: before new Model(materializedModel.modelArgs) -> log modelArgs');
  console.log('  - Line ~806: inside executeItemFunction SAVE -> log connectionField, objectId');
  hr();

  // -----------------------------------------------------------------------
  // Cleanup: delete test data (nested episodes, direct episode, season, serie)
  // -----------------------------------------------------------------------
  console.log('\nCleaning up test data...');

  for (const epId of nestedEpIds) {
    await gql(`mutation { deleteepisode(id: "${epId}") { id } }`);
  }

  if (directEp) {
    await gql(`mutation { deleteepisode(id: "${directEp.id}") { id } }`);
  }

  if (season?.id) {
    await gql(`mutation { deleteseason(id: "${season.id}") { id } }`);
  }

  if (serie?.id) {
    await gql(`mutation { deleteserie(id: "${serie.id}") { id } }`);
  }

  console.log('Done.\n');
})();
