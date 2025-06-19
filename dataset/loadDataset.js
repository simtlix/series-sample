const fetch = require('node-fetch');
const series = require('./dataset');

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

(async () => {
  for(let serie of series) {
    const { stars, name, categories, director, seasons } = serie;

    const starIds = await Promise.all(stars.map(async (star) => {
      const response = await sendRequest(
        `{ stars(name: {operator:EQ value:"${star}"}) { id } }`
      );
      const stars = response.data.stars;
      if (stars.length > 0) {
        return stars[0].id;
      } else {
        const response = await sendRequest(
          `mutation {
            addstar(input: {
              name: "${star}"
            }) {
              id
            }
          }`
        );
        return response.data.addstar.id;
      }
    }));

    const mutation = `mutation {
      addserie(input: {
        name: "${name}"
        categories: ${JSON.stringify(categories)}
        director: { name: "${director.name}" country: "${director.country}" }
        stars: {
          added: [
            ${starIds.map(starId => `{
              star: {id:"${starId}"}
            }`)}
          ]
        }
        seasons: { 
          added: [
            ${seasons.map(season => `{
                number: ${season.number}
                year: ${season.year}
                episodes: { 
                  added: [
                    ${season.episodes.map(episode => `{
                      number: ${episode.number}, name: "${episode.name}", date: "${new Date(episode.date).toISOString()}" 
                    }`)}
                  ]
                }
            }`)}
          ]
        }
      }) {
        id
        name
        director { name country }
        categories
        seasons {
          number
          year
          episodes {
            number name date
          }
        }
      }
    }`;
    
    console.log(mutation);
    //const response = await sendRequest(mutation);
    //console.log(response);
  }
})();

