# Simple Schema - GraphQL Schema Bridge

Change only your Meteor Simple Schema: GraphQL schema & resolvers are updated automatically.

Define your Simple Schemas for your collection and let `schema-graphql-bridge` do the tedious work of defining the schema's basic fields and resolvers, for you.

## How to use

`meteor add kuip:schema-graphql-bridge`

- demo: https://www.youtube.com/watch?v=5Z7ZSUIdamg

- take a look at: https://github.com/loredanacirstea/meteor-apollo-react-boilerplate/tree/master/imports/api

```
  let schema = SchemaBridge.schema(SimpleSchema, name, [options]);
  let resolvers = SchemaBridge.resolvers(SimpleSchema, name, [options]);

```

Options: `{wrap: Boolean, fields: [String], except: [String]}`

- `wrap`: default `true`
  - if set to `true`, `SchemaBridge.schema` will return a String with the GraphQL definitions for the SimpleSchema
  - set to `false` if you want to further edit the GraphQL schema (see examples)
  - if set to `false`, `SchemaBridge.schema` will return `{ objects, fields }`
      - `objects` = GraphQL type definitions for the SimpleSchema objects
      - `fields` = definitions for the first level SimpleSchema fields

- `fields`: Write schema definitions/resolvers only for these fields

- `except`: Write schema definitions/resolvers for all fields except these


### Simple Schema example:

```
  const subList = new SimpleSchema({
    field3: {
      type: Object
    },
    'field3.attr': {
      type: Object,
    },
    'field3.attr.something': {
      type: String
    }
  });

  Lists.schema = new SimpleSchema({
    _id: {
      type: String
    },
    title: { 
      type: String 
    },
    description: { 
      type: String 
    },
    sublist: {
      type: subList,
      optional: true
    },
  });

```

### Define your GraphQL schema

```
  // .../lists-schema.js
  import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
  import Lists from './lists';

  // Entire schema for the List entity:
  const listSchema = SchemaBridge.schema(Lists.schema, 'List');
  export default listSchema;

  // If you want to modify it afterwards:
  let listDefs = SchemaBridge.schema(Lists.schema, 'List', {wrap: false});

  const listSchema = `
    ${listDefs.objects}
    type List {
      ${listDefs.fields}
      tasks: [Task]
   }`;
  export default taskSchema;

```

### Define your GraphQL resolvers

```
  import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
  import Lists from './lists';
  import Tasks from '../tasks/tasks';

  let listResolvers = SchemaBridge.resolvers(Lists.schema, 'List');

  listResolvers.List.tasks = (root, args, context) => {
    return Tasks.find({list: root._id}).fetch();
  };

  export default listResolvers;
```

### This package and the above code replaces:

```
  type ListSublistField3Attr {
    something: ListSublistField3AttrSomething
  }
  type ListSublistField3 {
    attr: ListSublistField3Attr
  }
  type ListSublist {
    field3: ListSublistField3
  }
  type List {
    _id: String
    title: String 
    description: String 
    sublist: ListSublist
  }

```

```
  const resolvers = {
    List: {
      title: ({ title }) => title,
      description: ({ description }) => description,
      sublist: ({ sublist }) => sublist,
    },
    ListSublist: {
      field3: ({ field3 }) => field3
    },
    ListSublistField3: {}
  }
```

## Simple Schema types supported

Should work with all types.

- `Date` is transformed into `String`
- `Object`s are transformed into GraphQL object types, with a camel cased name, based on it's SimpleSchema path.

