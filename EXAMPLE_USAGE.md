# Simfinity Cursor Rules - Usage Examples

This document demonstrates how to use the Simfinity cursor rules to generate GraphQL types and complete projects.

## Quick Start

The cursor rules are now available in three specialized files:
- `.cursorrules` - Main rules for type generation
- `.cursorrules-mermaid` - Rules for generating from Mermaid diagrams  
- `.cursorrules-project` - Rules for generating complete projects

## Example 1: Generate Types from Application Description

**Prompt:**
```
Generate Simfinity.js types for an e-commerce system with the following entities:
- Product: name, description, price, stock, categories, status
- Category: name, description
- Order: orderNumber, status, total, customer, items
- Customer: email, name, address
- Address: street, city, country, postalCode
- OrderItem: quantity, unitPrice, product, order

Relationships:
- Product belongs to many Categories (many-to-many)
- Order has many OrderItems (one-to-many)
- OrderItem belongs to one Product (many-to-one)
- Order belongs to one Customer (many-to-one)
- Customer has one Address (one-to-one, embedded)
- Product has status enum: ACTIVE, INACTIVE, DISCONTINUED
- Order has status enum: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

Business rules:
- Product names must be unique
- Stock cannot be negative
- Order total must match sum of order items
- Customer email must be unique
- Product cannot be deleted if it has orders
```

**Expected Output:**
The cursor rules will generate:
- Complete type definitions for all entities
- Proper relations (embedded, collections, foreign keys)
- Custom scalars for validated fields
- Field and type validators
- Controllers with business logic
- State machines for Product and Order status
- Complete project structure

## Example 2: Generate from Mermaid Diagram

**Prompt:**
```
Generate Simfinity.js types from this Mermaid diagram:

```mermaid
classDiagram
    class User {
        +String email
        +String name
        +UserRole role
        +UserStatus status
        +Profile profile
    }
    
    class UserRole {
        <<enumeration>>
        ADMIN
        USER
        MODERATOR
    }
    
    class UserStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
        SUSPENDED
    }
    
    class Profile {
        +String bio
        +String avatar
        +Address address
    }
    
    class Address {
        +String street
        +String city
        +String country
    }
    
    class Post {
        +String title
        +String content
        +PostStatus status
        +DateTime createdAt
    }
    
    class PostStatus {
        <<enumeration>>
        DRAFT
        PUBLISHED
        ARCHIVED
    }
    
    class Comment {
        +String content
        +DateTime createdAt
    }
    
    User ||--|| Profile : has
    Profile ||--|| Address : located_at
    User ||--o{ Post : writes
    Post ||--o{ Comment : has
    User ||--o{ Comment : writes
```

**Expected Output:**
- `user.js` with role and status enums, embedded profile
- `profile.js` as embedded type (addNoEndpointType)
- `address.js` as embedded type (addNoEndpointType)
- `post.js` with status enum and state machine
- `comment.js` with relations to user and post
- Proper validators and controllers
- State machines for user and post status transitions

## Example 3: Generate Complete Project

**Prompt:**
```
Generate a complete Simfinity.js project for a library management system with:
- Book: title, author, isbn, genre, status, publishedDate
- Author: name, biography, birthDate
- Member: email, name, membershipType, joinDate
- Loan: book, member, loanDate, dueDate, returnDate, status
- Genre: name, description

Business rules:
- ISBN must be unique
- Member email must be unique
- Book cannot be loaned if already on loan
- Loan due date must be 14 days from loan date
- Overdue loans cannot be renewed
```

**Expected Output:**
- Complete project structure with all files
- Package.json with dependencies
- Main application file (index.js)
- All type definitions with proper relations
- Validators and controllers
- Sample data generation
- README with setup instructions
- Environment configuration

## Example 4: Generate Single Type

**Prompt:**
```
Generate a Product type with:
- Fields: name (required), description, price (required), sku (unique), categories (array)
- Relations: belongs to many Categories
- Validations: name length 2-100, price positive, sku format validation
- Business rules: cannot delete if has orders
```

**Expected Output:**
```javascript
import * as graphql from 'graphql';
import * as simfinity from '@simtlix/simfinity-js';
import { validateName, validatePrice, validateSku } from './validators/fieldValidators.js';
import { validateProductBusinessRules } from './validators/typeValidators.js';

const { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLList } = graphql;

const productType = new GraphQLObjectType({
  name: 'product',
  extensions: {
    validations: {
      create: [validateProductBusinessRules],
      update: [validateProductBusinessRules]
    }
  },
  fields: () => ({
    id: { type: GraphQLID },
    name: { 
      type: new GraphQLNonNull(GraphQLString),
      extensions: {
        validations: {
          save: [validateName],
          update: [validateName]
        }
      }
    },
    description: { type: GraphQLString },
    price: { 
      type: new GraphQLNonNull(GraphQLFloat),
      extensions: {
        validations: {
          save: [validatePrice],
          update: [validatePrice]
        }
      }
    },
    sku: {
      type: GraphQLString,
      extensions: {
        unique: true,
        validations: {
          save: [validateSku],
          update: [validateSku]
        }
      }
    },
    categories: {
      type: new GraphQLList(simfinity.getType('category')),
      extensions: {
        relation: {
          connectionField: 'product'
        }
      }
    }
  })
});

export default productType;
simfinity.connect(null, productType, 'product', 'products', productController);
```

## Example 5: Generate Validators

**Prompt:**
```
Generate validators for a User type with:
- Field validations: email format, name length, password strength
- Business rules: email uniqueness, password complexity
- Type validations: cannot delete if has posts
```

**Expected Output:**
Field validators:
```javascript
const validateEmail = async (typeName, fieldName, value, session) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid email address`);
  }
};

const validatePassword = async (typeName, fieldName, value, session) => {
  if (value && value.length < 8) {
    throw new ValidationError(`${fieldName} must be at least 8 characters long`);
  }
  if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    throw new ValidationError(`${fieldName} must contain uppercase, lowercase, and number`);
  }
};
```

Type validators:
```javascript
const validateUserBusinessRules = async (typeName, args, modelArgs, session) => {
  // Email uniqueness validation
  if (Object.prototype.hasOwnProperty.call(modelArgs, 'email')) {
    const userModel = simfinity.getModel('user');
    const existingUser = await userModel.findOne({
      email: modelArgs.email,
      _id: args.id ? { $ne: args.id } : undefined
    }).session(session);
    
    if (existingUser) {
      throw new BusinessError(`User with email "${modelArgs.email}" already exists`);
    }
  }
};
```

## Example 6: Generate Controller

**Prompt:**
```
Generate a controller for Order type with:
- onSaving: calculate total from items
- onUpdating: prevent status change to invalid states
- onDelete: check if order can be cancelled
```

**Expected Output:**
```javascript
const orderController = {
  onSaving: async (doc, args, session) => {
    // Calculate total from order items
    if (doc.items && doc.items.length > 0) {
      const itemModel = simfinity.getModel('orderItem');
      const items = await itemModel.find({ order: doc._id }).session(session);
      doc.total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }
  },

  onUpdating: async (id, doc, session) => {
    const orderModel = simfinity.getModel('order');
    const originalOrder = await orderModel.findById(id).session(session);
    
    // Prevent invalid status transitions
    if (doc.status && originalOrder.status) {
      const validTransitions = {
        'PENDING': ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED': ['SHIPPED', 'CANCELLED'],
        'SHIPPED': ['DELIVERED'],
        'DELIVERED': [],
        'CANCELLED': []
      };
      
      if (!validTransitions[originalOrder.status].includes(doc.status)) {
        throw new BusinessError(`Cannot change status from ${originalOrder.status} to ${doc.status}`);
      }
    }
  },

  onDelete: async (doc, session) => {
    if (doc.status === 'SHIPPED' || doc.status === 'DELIVERED') {
      throw new BusinessError(`Cannot delete order with status ${doc.status}`);
    }
  }
};
```

## Usage Tips

1. **Be Specific**: Provide detailed field lists, relationships, and business rules
2. **Use Examples**: Reference the series-sample patterns when describing requirements
3. **Include Validations**: Always specify what validations are needed
4. **Mention Controllers**: Describe any business logic that needs to be implemented
5. **State Machines**: Specify which entities need state management

## Advanced Features

### Custom Scalars
```
Generate a custom scalar for ISBN validation that:
- Must be 10 or 13 digits
- Validates check digit for ISBN-10
- Validates check digit for ISBN-13
```

### Complex Relations
```
Generate a many-to-many relation between User and Role with:
- Junction table UserRole with additional fields: assignedDate, assignedBy
- Business rules: only admins can assign roles
- Validations: user cannot have duplicate roles
```

### State Machines
```
Generate a state machine for Order with states:
- PENDING -> CONFIRMED (requires payment)
- CONFIRMED -> SHIPPED (requires inventory check)
- SHIPPED -> DELIVERED (automatic after 3 days)
- Any state -> CANCELLED (if within 24 hours)
```

The cursor rules will handle all these complex scenarios and generate production-ready Simfinity.js code that follows the exact patterns from the series-sample project.
