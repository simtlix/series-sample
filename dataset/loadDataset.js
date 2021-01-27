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


series.forEach(serie => {
  const { star, name, categories, director, seasons } = serie;
  const starPromise = new Promise((resolve) => {
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
  });

  starPromise.then(starId => {
    const mutation = `mutation {
      addserie(input: {
        name: "${name}"
        categories: ${JSON.stringify(categories)}
        director: { name: "${director.name}" country: "${director.country}" }
        star:{ id: "${starId}" }
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

    sendRequest(mutation, function(response) { console.log(response); }
    );
  });
});
