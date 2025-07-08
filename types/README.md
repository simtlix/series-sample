# Series Sample Types - Enhanced with Simfinity.js

This directory contains the GraphQL types for the Series Sample application, enhanced with comprehensive validators, controllers, and custom errors following the [Simfinity.js documentation](https://github.com/simtlix/simfinity.js).

## Overview

The types have been improved with:

- **Field-level validations**: Individual field validation rules
- **Type-level validations**: Business logic validation across entire objects
- **Controllers**: Before/after hooks for save, update, and delete operations
- **Custom errors**: Domain-specific error handling
- **State machines**: For managing complex state transitions (seasons)

## Type Structure

### 1. Serie Type (`serie.js`)
**Purpose**: Represents a TV series with its metadata and relationships.

**Features**:
- Unique name validation
- Category validation (1-10 categories, max 50 chars each)
- Required director relationship
- Business rules validation
- Auto-generated IDs
- Category normalization (trim, unique)

**Validations**:
- Field: `name` (required, 2-100 chars, unique)
- Field: `categories` (array validation, content validation)
- Type: Business rules (requires categories, director)

### 2. Star Type (`star.js`)
**Purpose**: Represents actors/actresses who can be assigned to series.

**Features**:
- Unique name validation
- Name normalization
- Cascade delete protection (check assignments)

**Validations**:
- Field: `name` (required, 2-100 chars, unique across stars)
- Type: Business rules (name uniqueness)

### 3. Episode Type (`episode.js`)
**Purpose**: Individual episodes within seasons.

**Features**:
- Episode number validation (1-999)
- Date validation (no future dates)
- Required season relationship
- Auto-generated IDs and default dates

**Validations**:
- Field: `number` (positive, max 999)
- Field: `name` (required, max 200 chars)
- Field: `date` (valid date, not future)
- Type: Business rules (unique episode numbers per season)

### 4. Season Type (`season.js`)
**Purpose**: Seasons within series with state management.

**Features**:
- State machine (SCHEDULED → ACTIVE → FINISHED)
- Season number validation (1-50)
- Year validation (1900-current+5)
- Unique season numbers per series
- Read-only state field (managed by state machine)

**Validations**:
- Field: `number` (positive, max 50)
- Field: `year` (1900-current+5)
- Type: Business rules (unique season numbers per series)

**State Machine**:
```javascript
{
  initialState: 'SCHEDULED',
  actions: {
    activate: { from: 'SCHEDULED', to: 'ACTIVE' },
    finalize: { from: 'ACTIVE', to: 'FINISHED' }
  }
}
```

### 5. Director Type (`director.js`)
**Purpose**: Directors of series (embedded type).

**Features**:
- Name and country validation
- Name/country normalization
- No endpoint type (embedded only)

**Validations**:
- Field: `name` (required, 2-100 chars)
- Field: `country` (required, 2-100 chars)

### 6. AssignedStarAndSerie Type (`assignedStarAndSerie.js`)
**Purpose**: Junction table for star-series assignments.

**Features**:
- Referential integrity validation
- Unique assignment validation
- Auto-generated IDs

**Validations**:
- Type: Business rules (valid references, unique assignments)

## Validators

### Field Validators (`validators/fieldValidators.js`)
Individual field validation functions:

- `validateName`: String validation (2-100 chars, not empty)
- `validatePositiveNumber`: Positive number validation
- `validateEpisodeNumber`: Episode-specific number validation
- `validateSeasonNumber`: Season-specific number validation
- `validateYear`: Year range validation
- `validateDate`: Date validation (no future dates)
- `validateCategories`: Array validation with content rules
- `validateCountry`: Country name validation
- `validateUniqueStarName`: Star name uniqueness
- `validateUniqueSerieName`: Serie name uniqueness

### Type Validators (`validators/typeValidators.js`)
Business logic validation across entire objects:

- `validateEpisodeBusinessRules`: Episode business rules (unique episode numbers per season)
- `validateEpisodeFields`: Episode field validation for creation
- `validateStarBusinessRules`: Star business rules (name uniqueness)
- `validateAssignedStarAndSerieBusinessRules`: Assignment business rules (referential integrity, unique assignments)

## Controllers

### Serie Controller (`controllers/serieController.js`)
Lifecycle hooks for serie CRUD operations:

**Methods**:
- `onSaving`: Executed before saving a serie
  - Logs creation message
  - Normalizes categories (trim, unique, filter empty)
- `onUpdating`: Executed before updating a serie
  - Logs update message
  - Prevents modification of `createdAt` field
- `onDelete`: Executed before deleting a serie
  - Logs deletion message
  - Checks for existing seasons and prevents deletion if any exist
  - Uses proper session management for transactional consistency

**Session Management**: All database operations properly use session parameters for transactional consistency.

**Other Types**: Other types (star, season, episode, director, assignedStarAndSerie) currently have no controllers and use default Simfinity.js behavior.

## Custom Errors

### Error Types (`validators/customErrors.js`)
Domain-specific error classes:

- `ValidationError`: Field validation errors (400)
- `BusinessError`: Business logic errors (400)
- `AuthorizationError`: Authorization errors (401)
- `NotFoundError`: Not found errors (404)
- `ConflictError`: Conflict errors (409)
- Domain-specific errors: `SerieNotFoundError`, `SeasonNotFoundError`, etc.

## Usage Examples

### Creating a Serie with Validation
```graphql
mutation {
  addserie(input: {
    name: "Breaking Bad"
    categories: ["Drama", "Crime", "Thriller"]
    director: {
      name: "Vince Gilligan"
      country: "United States"
    }
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

### State Machine Operations
```graphql
mutation {
  activateseason(id: "season_123") {
    id
    number
    state
  }
}
```

### Error Handling
The system will return appropriate error messages for:
- Validation failures (field-level)
- Business rule violations (type-level)
- Referential integrity issues
- State machine violations

## Configuration

The types are configured with Simfinity.js using:

```javascript
simfinity.connect(null, type, 'singular', 'plural', null, null, stateMachine);
```

For types with state machines, the state field is automatically managed and read-only.

## Recent Improvements

### Field Name Consistency
Fixed field name inconsistencies throughout the codebase:
- **Episode Type**: Uses `season` field (not `seasonID`)
- **AssignedStarAndSerie Type**: Uses `serie` and `star` fields (not `serieID`, `starID`)
- **Serie Controller**: Fixed console logging to use `doc.name` (not `doc.title`)

### Session Management
Enhanced database operation consistency:
- **All Validators**: Proper session usage in database queries
- **Controllers**: Session-aware database operations
- **Transactional Integrity**: All operations run within the same database session

### Code Quality
- **ESLint**: Updated to latest version (9.30.1) with ES2024 support
- **Flat Config**: Migrated to modern ESLint flat configuration format
- **Lint-Free**: All code passes linting with no errors

## Best Practices Implemented

1. **Separation of Concerns**: Validators, controllers, and errors are separated
2. **Reusability**: Field validators can be reused across types
3. **Error Handling**: Comprehensive error types with proper HTTP status codes
4. **Business Logic**: Type-level validators for complex business rules
5. **Data Integrity**: Referential integrity and uniqueness constraints
6. **State Management**: Proper state machine implementation for seasons
7. **Logging**: Controllers provide appropriate logging for operations
8. **Normalization**: Data normalization in controllers (trim, unique arrays)
9. **Session Management**: All database operations use proper session handling
10. **Field Consistency**: Consistent field naming across all types and validators

## Dependencies

- `@simtlix/simfinity-js`: Core framework
- `graphql`: GraphQL types
- `graphql-iso-date`: DateTime support

This implementation follows the Simfinity.js documentation patterns and provides a robust foundation for the series management system. 