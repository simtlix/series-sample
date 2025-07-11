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
    categories: ["Crime", "Drama", "Thriller"]
    director: { 
      name: "Vince Gilligan" 
      country: "United States" 
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
    name
  }
}
```

### Adding a Series with Stars

To add a series with stars, you need to first create the stars and then use their returned IDs:

**Step 1: Create the stars**

```graphql
mutation {
  addstar(input: {
    name: "Bryan Cranston"
  }) {
    id
    name
  }
}
```

```graphql
mutation {
  addstar(input: {
    name: "Aaron Paul"
  }) {
    id
    name
  }
}
```

**Step 2: Add the series using the star IDs**

```graphql
mutation {
  addserie(input: {
    name: "Better Call Saul"
    categories: ["Crime", "Drama"]
    director: { 
      name: "Vince Gilligan" 
      country: "United States" 
    }
    stars: {
      added: [
        {
          star: {id: "USE_ACTUAL_STAR_ID_HERE"}
        },
        {
          star: {id: "USE_ACTUAL_STAR_ID_HERE"}
        }
      ]
    }
    seasons: { 
      added: [
        {
          number: 1
          year: 2015
          episodes: { 
            added: [
              {
                number: 1
                name: "Uno"
                date: "2015-02-08T02:00:00.000Z"
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
    stars {
      star {
        id
        name
      }
    }
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

**Note**: Replace `"USE_ACTUAL_STAR_ID_HERE"` with the actual IDs returned from the star creation mutations. The IDs are MongoDB ObjectIds (24-character hex strings).

### Adding a Season to an Existing Series

To add a season to an existing series, you need to first get the series ID and then create the season:

**Step 1: Get the series ID**

```graphql
query {
  series(name: {
    operator: EQ,
    value: "Breaking Bad"
  }) {
    id
    name
    seasons {
      number
      year
      state
    }
  }
}
```

**Step 2: Add the season using the series ID**

```graphql
mutation {
  addseason(input: {
    number: 6
    year: 2024
    serie: "USE_ACTUAL_SERIES_ID_HERE"
  }) {
    id
    number
    year
    state
    serie {
      id
      name
    }
    episodes {
      id
      number
      name
    }
  }
}
```

**Note**: Replace `"USE_ACTUAL_SERIES_ID_HERE"` with the actual series ID from the query above. The season will be created with the initial state "SCHEDULED".

## GraphQL Query Examples

**Note:** These examples use the correct simfinity.js filter syntax. The format depends on the field type:

- **Scalar fields** (string, number, etc.): Use `{ operator: EQ, value: "something" }`
- **ObjectType fields**: Use `{ terms: [{ path: "fieldName", operator: EQ, value: "something" }] }`
- **Deep nested paths**: Use dot notation in the path like `"episodes.name"` or `"director.country"`
- **Multiple filters**: You can combine both scalar and ObjectType filters in the same query

For more detailed information about available operators and filter options, see the [simfinity.js documentation](https://github.com/simtlix/simfinity.js).

## Key Filtering Principle

**🔑 Filters are ALWAYS applied at the root/first entity level, never at nested levels.**

This is a fundamental concept in simfinity.js that differs from traditional GraphQL approaches:

### ✅ Correct Approach
```graphql
# Filter applied at the ROOT level (series)
series(
  seasons: { 
    terms: [{ path: "episodes.name", operator: EQ, value: "Pilot" }] 
  }
) {
  id
  name
  seasons {
    episodes {
      name
    }
  }
}
```

### ❌ Incorrect Approach
```graphql
# This does NOT work - filters cannot be applied at nested levels
series {
  seasons {
    episodes(name: { operator: EQ, value: "Pilot" }) {  # WRONG!
      name
    }
  }
}
```

### How It Works
1. **Start at the root entity** (e.g., `series`, `episodes`, `seasons`)
2. **Apply filters as parameters** to that root entity
3. **Use dot notation** in the `path` field to reach nested properties
4. **Let simfinity.js handle** the traversal and filtering logic automatically

This approach ensures efficient database queries and consistent filtering behavior across all relationship types.

### 1. Series with Directors from a Specific Country

Find all series that have directors from the United States:

```graphql
query {
  series(director: {
    terms: [
      {
        path: "country",
        operator: EQ,
        value: "United States"
      }
    ]
  }) {
    id
    name
    categories
    director {
      name
      country
    }
  }
}
```

### 2. Series with a Specific Episode Name

Find series that contain an episode with the name "Pilot":

```graphql
query {
  series(
    seasons: {
      terms: [
        {
          path: "episodes.name",
          operator: EQ,
          value: "Pilot"
        }
      ]
    }
  ) {
    id
    name
    seasons {
      number
      episodes {
        number
        name
        date
      }
    }
  }
}
```

Alternative approach using episodes endpoint:

```graphql
query {
  episodes(name: {
    operator: EQ,
    value: "Pilot"
  }) {
    id
    name
    number
    date
    season {
      number
      year
      serie {
        name
        director {
          name
          country
        }
      }
    }
  }
}
```

### 3. Series with a Particular Star

Find series that feature "Bryan Cranston":

```graphql
query {
  assignedStarsAndSeries(star: {
    terms: [
      {
        path: "name",
        operator: EQ,
        value: "Bryan Cranston"
      }
    ]
  }) {
    id
    star {
      name
    }
    serie {
      id
      name
      categories
      director {
        name
        country
      }
    }
  }
}
```

Alternative approach starting from the series entity:

```graphql
query {
  series(
    stars: {
      terms: [
        {
          path: "star.name",
          operator: EQ,
          value: "Bryan Cranston"
        }
      ]
    }
  ) {
    id
    name
    categories
    director {
      name
      country
    }
    stars {
      star {
        name
      }
    }
  }
}
```

Or find all stars in a specific series:

```graphql
query {
  assignedStarsAndSeries(serie: {
    terms: [
      {
        path: "name",
        operator: EQ,
        value: "Breaking Bad"
      }
    ]
  }) {
    id
    star {
      name
    }
    serie {
      name
    }
  }
}
```

### 4. Seasons from Series with Directors from a Given Country

Find all seasons that belong to series directed by someone from the United States:

```graphql
query {
  seasons {
    id
    number
    year
    state
    serie {
      name
      director {
        name
        country
      }
    }
  }
}
```

Filter seasons specifically for US directors:

```graphql
query {
  seasons(serie: {
    terms: [
      {
        path: "director.country",
        operator: EQ,
        value: "United States"
      }
    ]
  }) {
    id
    number
    year
    state
    serie {
      name
      categories
      director {
        name
        country
      }
    }
    episodes {
      number
      name
      date
    }
  }
}
```

### 5. Combining Scalar and ObjectType Filters

Find series named "Breaking Bad" that have at least one season with number 1:

```graphql
query {
  series(
    name: {
      operator: EQ,
      value: "Breaking Bad"
    }
    seasons: {
      terms: [
        {
          path: "number",
          operator: EQ,
          value: 1
        }
      ]
    }
  ) {
    id
    name
    director {
      name
      country
    }
    seasons {
      number
      episodes {
        name
      }
    }
  }
}
```

### 6. Complex Nested Queries

Get complete information for a specific series:

```graphql
query {
  series(name: {
    operator: EQ,
    value: "Breaking Bad"
  }) {
    id
    name
    categories
    director {
      name
      country
    }
    seasons {
      number
      year
      state
      episodes {
        number
        name
        date
      }
    }
  }
}
```

### 7. Episodes from a Specific Season and Series

Find all episodes from Season 1 of Breaking Bad:

```graphql
query {
  episodes(season: {
    terms: [
      {
        path: "number",
        operator: EQ,
        value: 1
      },
      {
        path: "serie.name",
        operator: EQ,
        value: "Breaking Bad"
      }
    ]
  }) {
    id
    number
    name
    date
    season {
      number
      year
      serie {
        name
      }
    }
  }
}
```

### 8. Series by Category

Find all crime series:

```graphql
query {
  series(categories: {
    operator: EQ,
    value: "Crime"
  }) {
    id
    name
    categories
    director {
      name
      country
    }
  }
}
```

### 9. Search by Partial Episode Name

Find episodes containing "Fire" in the name:

```graphql
query {
  episodes(name: {
    operator: LIKE,
    value: "Fire"
  }) {
    id
    number
    name
    date
    season {
      number
      serie {
        name
      }
    }
  }
}
```

### 10. Pagination

Simfinity.js supports built-in pagination with optional total count:

```graphql
query {
  series(
    categories: {
      operator: EQ,
      value: "Crime"
    }
    pagination: {
      page: 1,
      size: 2,
      count: true
    }
  ) {
    id
    name
    categories
    director {
      name
      country
    }
  }
}
```

#### Pagination Parameters:
- **page**: Page number (starts at 1, not 0)
- **size**: Number of items per page
- **count**: Optional boolean - if `true`, returns total count of matching records

#### Getting Total Count:
When `count: true` is specified, the total count is available in the response extensions. You need to configure an Envelop plugin to expose it:

```javascript
// Envelop plugin for count in extensions
function useCountPlugin() {
  return {
    onExecute() {
      return {
        onExecuteDone({result, args}) {
          if (args.contextValue?.count) {
            result.extensions = {
              ...result.extensions,
              count: args.contextValue.count,
            };
          }
        }
      };
    }
  };
}
```

#### Example Response:
```json
{
  "data": {
    "series": [
      {
        "id": "1",
        "name": "Breaking Bad",
        "categories": ["Crime", "Drama"],
        "director": {
          "name": "Vince Gilligan",
          "country": "United States"
        }
      },
      {
        "id": "2", 
        "name": "Better Call Saul",
        "categories": ["Crime", "Drama"],
        "director": {
          "name": "Vince Gilligan",
          "country": "United States"
        }
      }
    ]
  },
  "extensions": {
    "count": 15
  }
}
```

### 11. Sorting

Simfinity.js supports sorting with multiple fields and sort orders:

```graphql
query {
  series(
    categories: { operator: EQ, value: "Crime" }
    pagination: { page: 1, size: 5, count: true }
    sort: {
      terms: [
        {
          field: "name",
          order: DESC
        }
      ]
    }
  ) {
    id
    name
    categories
    director {
      name
      country
    }
  }
}
```

#### Sorting Parameters:
- **sort**: Contains sorting configuration
- **terms**: Array of sort criteria (allows multiple sort fields)
- **field**: The field name to sort by
- **order**: Sort order - `ASC` (ascending) or `DESC` (descending)

#### Sorting by Nested Fields:
You can sort by fields from related/nested objects using dot notation:

```graphql
query {
  series(
    categories: { operator: EQ, value: "Drama" }
    pagination: { page: 1, size: 5, count: true }
    sort: {
      terms: [
        {
          field: "director.name",
          order: DESC
        }
      ]
    }
  ) {
    id
    name
    categories
    director {
      name
      country
    }
  }
}
```

#### Multiple Sort Fields:
You can sort by multiple fields with different orders:

```graphql
query {
  series(
    sort: {
      terms: [
        { field: "director.country", order: ASC },
        { field: "name", order: DESC }
      ]
    }
  ) {
    id
    name
    director {
      name
      country
    }
  }
}
```

#### Combining Features:
The example above demonstrates combining **filtering**, **pagination**, and **sorting** in a single query - a common pattern for data tables and lists with full functionality.

### 12. Series Released in a Specific Year Range

Find series with seasons released between 2010-2015:

```graphql
query {
  seasons(year: {
    operator: BETWEEN,
    value: [2010, 2015]
  }) {
    id
    number
    year
    serie {
      name
      director {
        name
        country
      }
    }
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

## State Machine Implementation

Simfinity.js provides built-in state machine support for managing entity lifecycles. This project demonstrates state machine implementation in the Season entity.

### State Machine Configuration

State machines are defined as objects with `initialState` and `actions` properties:

```javascript
const stateMachine = {
  initialState: 'SCHEDULED',
  actions: {
    activate: {
      from: 'SCHEDULED',
      to: 'ACTIVE',
      action: async (params) => {
        console.log('Season activated:', JSON.stringify(params));
      }
    },
    finalize: {
      from: 'ACTIVE',
      to: 'FINISHED',
      action: async (params) => {
        console.log('Season finalized:', JSON.stringify(params));
      }
    }
  }
};

// Connect type with state machine
simfinity.connect(null, seasonType, 'season', 'seasons', null, null, stateMachine);
```

### Season States

The Season entity has three states:

1. **SCHEDULED** - Initial state when season is created
2. **ACTIVE** - Season is currently airing
3. **FINISHED** - Season has completed airing

### State Transitions

**Available transitions:**
- `activate`: SCHEDULED → ACTIVE
- `finalize`: ACTIVE → FINISHED

### State Machine Mutations

Simfinity.js automatically generates state transition mutations:

```graphql
# Activate a scheduled season
mutation {
  activateseason(id: "season_id_here") {
    id
    number
    year
    state
    serie {
      name
    }
  }
}
```

```graphql
# Finalize an active season
mutation {
  finalizeseason(id: "season_id_here") {
    id
    number
    year
    state
    serie {
      name
    }
  }
}
```

### State Machine Features

**Validation:**
- Only valid transitions are allowed
- Attempting invalid transitions returns an error
- State field is read-only (managed by state machine)

**Custom Actions:**
- Each transition can execute custom business logic
- Actions receive parameters including entity data
- Actions can perform side effects (logging, notifications, etc.)

**Query by State:**
```graphql
query {
  seasons(state: {
    operator: EQ,
    value: ACTIVE
  }) {
    id
    number
    year
    state
    serie {
      name
    }
  }
}
```

### State Machine Best Practices

1. **Initial State**: Always define a clear initial state
2. **Linear Flows**: Design logical progression (SCHEDULED → ACTIVE → FINISHED)
3. **Validation**: Use state to enforce business rules
4. **Actions**: Implement side effects in transition actions
5. **Error Handling**: Handle transition failures gracefully

### Example Workflow

```graphql
# 1. Create season (automatically SCHEDULED)
mutation {
  addseason(input: {
    number: 6
    year: 2024
    serie: "series_id_here"
  }) {
    id
    state  # Will be "SCHEDULED"
  }
}

# 2. Activate season when airing begins
mutation {
  activateseason(id: "season_id_here") {
    id
    state  # Will be "ACTIVE"
  }
}

# 3. Finalize season when completed
mutation {
  finalizeseason(id: "season_id_here") {
    id
    state  # Will be "FINISHED"
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
