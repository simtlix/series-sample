var request = require('request');
const series = require('./dataset');

const sendRequest = (body, callback) => {
  const options = {
    'method': 'POST',
    'url': 'http://localhost:3000/graphql',
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: body,
    })
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    callback(response.body);
  }, );
};

(async () => {
  for(let serie of series) {
    const { stars, name, categories, director, seasons } = serie;

    const starIds = await Promise.all(stars.map(star => 
      new Promise((resolve) => {
        sendRequest(
          `{ stars(name: {operator:EQ value:"${star}"}) { id } }`, 
          function(response) {
            const stars = JSON.parse(response).data.stars;
            if (stars.length > 0) {
              resolve(stars[0].id);
            } else {
              resolve(
                new Promise((resolve) => {
                  sendRequest(
                    `mutation {
                      addstar(input: {
                        name: "${star}"
                      }) {
                        id
                      }
                    }`, function(response) {
                      resolve(JSON.parse(response).data.addstar.id);
                    }
                  );
                })
              );
            }
          }
        );
      })
    ));

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
                      number: ${episode.number}, name: "${episode.name}", date: "${new Date(episode.date).toISOString().substring(0,10)}" 
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

    sendRequest(mutation, function(response) { console.log(response); });
  }
})();

