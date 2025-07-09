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

## Architecture Patterns

### Embedded vs Referenced Types

This project demonstrates two different data relationship patterns:

#### Embedded Types (Director)
Some types are designed to be **embedded** within other documents rather than having their own collection:

```javascript
// types/director.js - Uses addNoEndpointType() instead of connect()
const directorType = new GraphQLObjectType({
  name: 'director',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: GraphQLString }
  })
});

// Adds to GraphQL schema without creating endpoints
simfinity.addNoEndpointType(directorType);

// Used in serie.js with embedded: true
director: {
  type: new GraphQLNonNull(directorType),
  extensions: {
    relation: {
      embedded: true,  // ← Director data stored within serie document
      displayField: 'name'
    }
  }
}
```

**When to use embedded types:**
- Simple objects with few fields
- Data that doesn't need its own CRUD operations
- Objects that belong to a single parent (1:1 or few:1 relationships)
- Examples: Address, Settings, Director info

#### Referenced Types (Season, Episode, Star)
Other types have their own collections and GraphQL endpoints:

```javascript
// types/season.js - Uses simfinity.connect()
simfinity.connect(null, seasonType, 'season', 'seasons', null, null, stateMachine);

// Used in serie.js with connectionField
seasons: {
  type: new GraphQLList(seasonType),
  extensions: {
    relation: { 
      connectionField: 'serie'  // ← References season documents by serie ID
    }
  }
}
```

**When to use referenced types:**
- Complex objects with many fields
- Data that needs CRUD operations (add/update/delete endpoints)
- Objects shared between multiple parents (many:many relationships)
- Objects with their own business logic (controllers, state machines)
- Examples: Season, Episode, Star, User

### GraphQL Endpoint Generation
- **Embedded types**: Use `addNoEndpointType()` - Added to schema but no endpoints generated
- **Referenced types**: Use `connect()` - Full CRUD endpoints automatically generated
  - `addseason`, `updateseason`, `deleteseason`
  - `season`, `seasons` queries

### Simfinity Methods Summary
- `simfinity.addNoEndpointType(directorType)` - Type available in schema, no endpoints
- `simfinity.connect(null, seasonType, 'season', 'seasons')` - Full CRUD endpoints generated

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
