# series-sample
TV series microservice created with simfinity.js

![series model](https://drive.google.com/uc?export=view&id=1J-dIcMMYg-BnSYe2gLFYi0EeptdzTPyG)

## Data Structure

The application manages TV series with the following structure:
- Series (name, categories, director)
- Seasons (number, year)
- Episodes (number, name, date)
- Stars (actors)
- Directors (name, country)

## GraphQL Mutations Examples

### Adding a Series with Seasons and Episodes

```graphql
mutation {
  addserie(input: {
    name: "Breaking Bad"
    categories: ["crime", "drama", "thriller"]
    director: { 
      name: "Vince Gilligan" 
      country: "United States" 
    }
    stars: {
      added: [
        {
          star: {id: "star_id_1"}
        },
        {
          star: {id: "star_id_2"}
        }
      ]
    }
    seasons: { 
      added: [
        {
          number: 1
          year: 2008
          episodes: { 
            added: [
              {
                number: 1
                name: "Pilot"
                date: "2008-01-20T02:00:00.000Z"
              },
              {
                number: 2
                name: "Cat's in the Bag..."
                date: "2008-01-27T02:00:00.000Z"
              }
            ]
          }
        }
      ]
    }
  }) {
    id
    name
    director { 
      name 
      country 
    }
    categories
    seasons {
      number
      year
      episodes {
        number 
        name 
        date
      }
    }
  }
}
```

### Adding a Star

```graphql
mutation {
  addstar(input: {
    name: "Bryan Cranston"
  }) {
    id
  }
}
```

## Setup Steps
- install node.js
- install run-rs globally (npm install -g run-rs)
- run: npm install
- run: run-rs
- run: npm start

## Development

### Code Quality
- **ESLint**: Configured with ES2024 support using flat config format
- **Linting**: Run `npm run lint` to check code quality
- **Validation**: Comprehensive field and type-level validation
- **Session Management**: All database operations use proper session handling for transactional consistency

### Database Scripts
- **Load Dataset**: `node dataset/loadDataset.js` - Loads sample data
- **Delete Dataset**: `node dataset/deleteDataset.js` - Removes all data

## Available Series in the Dataset
1. Breaking Bad (5 seasons)
2. Better Call Saul (5 seasons)
3. Game of Thrones (8 seasons)

Each series includes:
- Complete episode information
- Director details
- Cast information
- Season and episode air dates
