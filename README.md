# Simple Schema - GraphQL Schema Bridge

Change only your Meteor Simple Schema: GraphQL schema & resolvers are updated automatically.

Define your Simple Schemas for your collection and let `schema-graphql-bridge` do the tedious work of defining the schema's fields and resolvers, for you.

## How to use

`meteor add kuip:schema-graphql-bridge`

- demo: https://www.youtube.com/watch?v=5Z7ZSUIdamg

- take a look at: https://github.com/loredanacirstea/meteor-apollo-react-boilerplate/tree/master/imports/api

```
  let schema = SchemaBridge.schema(SimpleSchema, [options]);
  let resolvers = SchemaBridge.resolvers(SimpleSchema, [options]);
  let mocks = SchemaBridge.mocks(SimpleSchema, [options]);

```

Options: `{name: String, fields: [], except: []}`

- `name`: The GraphQL entity's name; if provided, the schema definitions or resolvers are wrapped in a `type List{}` / {List: resolvers} / {List: mocks}

- `fields`: Write schema definitions/resolvers/mocks only for these fields

- `except`: Write schema definitions/resolvers/mocks for all fields except these


### Simple Schema example:

```
  Tasks.schema = new SimpleSchema({
    title: { 
      type: String 
    },
    description: { 
      type: String 
    },
    ordering: {
      type: Number,
      optional: true,
    },
    status: {
      type: Number,
      label: 'Status',
      allowedValues: [0, 1, 2]
    },
    creator: {
      type: String,
      label: 'Creator'
    },
    list: {
      type: String
    },
  });

```

### Define your GraphQL schema

```
  // .../tasks-schema.js
  import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
  import Tasks from './tasks';

  // Entire schema for the Task entity:
  const taskSchema = SchemaBridge.schema(Tasks.schema, {name: 'Task'});
  export default taskSchema;

  // If you want to modify it afterwards:
  let fieldsSchema = SchemaBridge.schema(Tasks.schema);

  const taskSchema = `
    type Task {
      _id: ID!
      ${fieldsSchema}
      taskList: List
    }
  `;
  export default taskSchema;

```

### Define your GraphQL resolvers

```
  import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
  import Tasks from './tasks';
  import Lists from '../lists/lists';

  let taskResolvers = SchemaBridge.resolvers(Tasks.schema);

  taskResolvers.taskList = (root, args, context) => {
    return Lists.findOne(root.list || args.list)
  };

  export default taskResolvers;
```

## Simple Schema types supported:

(all except `Object` and `[Object]`)

```
  String
  Number
  Boolean
  Date
  [String]
  [Number]
  [Boolean]
  [Date]

```

