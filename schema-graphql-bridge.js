export default SchemaBridge = {
  schema: (schema, name, { fields, except, wrap=true }={}) => {
    const S = schema._schema;
    let keys, content, objs;

    // Get field definitions for the main type
    keys = getFields({schema, fields, except});
    content = keys.keys.map(k => {
      return getFieldSchema(schema, k, name);
    });
    content = content.reduce((a,b) => `${a}${b}`);

    // Get type definitions for the contained objects
    objs = keys.objectKeys.map(k => {
      return getObjectSchema(schema, k, name);
    });
    objs = objs.length ? (objs.reduce((a,b) => `${a}${b}`)) : '';

    console.log('schema objs: ', objs)
    console.log('schema fields: ', content)

    if(!wrap)
      return { objects: objs, fields: content};

    return `
      ${objs}
      type ${name} {
        ${content}
      }
    `;
  },
  resolvers: (schema, name, { fields, except, wrap=true } = {}) => {
    const S = schema._schema;
    let keys = getFields({schema, fields, except}, true);
    let res = {};
    res[name] = {};
    // resolvers for each field - probably not necessary
    keys.keys.forEach(k => {
      res[name][k] = function(root, args, context) {
        return root[k];
      };
    });
    
    // Rezolvers for the contained objects, defined as new GraphQL types
    keys.objectKeys.forEach(key => {
      let splitter = schema._objectKeys[key+'.'] 
        ? '.' 
        : schema._objectKeys[key+'.$.'] ? '.$.': null;
      if(!splitter)
        return ``;
      console.log('key: ', key)
      if(!schema._objectKeys[key+splitter].length)
        return ``;

      let k = key.split(splitter), attr = k[k.length-1];
      if(k.length == 1)
        obj = res[name];
      else
        obj = k.slice(1, k.length-1).reduce((a,b) => a[camel(b)], res[typeName(k[0],name)]);

      obj[attr] = function(root, args, context) {
        return root[attr];
      };
      res[typeName(key, name)] = {};
    });
    //console.log(res);
    return res;
    
  },
  // Mocks do not support Objects
  mocks: (schema, name, { fields, except, wrap=true } = {}) => {
    const S = schema._schema;
    let keys = getFields({schema, fields, except}),
      mocks = {};
    keys.keys.forEach(k => {
      if(gqlType[S[k].type])
        mocks[gqlType[S[k].type]] = defaultMocks[gqlType[S[k].type]];
    })

    if(name)
      mocks[name] = () => {
        let obj = {};
        keys.forEach(k => {
          if(gqlType[S[k].type])
            obj[k] = defaultMocks[gqlType[S[k].type]];
        })
        return obj;
      }

    return mocks;
  }
};

const camel = k => k[0].toUpperCase() + k.substr(1);

// If we have a SimpleSchema key for an Object such as "sublist.subobject.attributes" and the entity name : "List"
// we name the new GraphQL type like: ListSublistSubobjectAttributes
const typeName = (key, name) => name + (key.split('.').reduce((a,b) => a+camel(b), ''));

// Get field key definition
const getFieldSchema = (schema, k, name) => {
  const S = schema._schema;
  let key = k.substr(k.lastIndexOf('.')+1),
    value = null;

  if(S[k].type == Object) {
    // Only add it if it has keys
    if(schema._objectKeys[k+'.'] && schema._objectKeys[k+'.'].length)
      value = `${typeName(k, name)}`;
  }
  else if(S[k].type == Array && S[`${k}.$`]) {
    if(gqlType[S[`${k}.$`].type])
      value = `[${gqlType[S[`${k}.$`].type]}]`;
    // Maybe it is an Object
    else if(!value && schema._objectKeys[k+'.$.'])
      value = `[${typeName(k, name)}]`;
  }
  else
    value = `${gqlType[S[k].type]}`;

  if(!value)
    return ``;

  return `
    ${key}: ${value}`;
};

// Set a new GraphQL type definition
const getObjectSchema = (schema, key, name) => {
  let splitter = schema._objectKeys[key+'.'] 
    ? '.' 
    : schema._objectKeys[key+'.$.'] ? '.$.': null;
  if(!splitter)
    return ``;
    
  let content = schema._objectKeys[key+splitter].map(k => {
    return `${getFieldSchema(schema, `${key + splitter + k}`, name)}`;
  });
  if(!content.length)
    return ``;
  content = content.reduce((a,b) => `${a}${b}`);

  return `
  type ${typeName(key, name)} {
      ${content}
  }`;
};


const getFields = ({schema, fields, except=[]}, noObjects) => {
  const S = schema._schema;
  let keys, objectKeys;

  if(fields && !fields.length)
    fields = null;
  if(except && !except.length)
    except = null;

  // Get firstLevelKeys
  keys = schema._firstLevelSchemaKeys.filter(k => {
    if(noObjects && S[k].type == Object)
      return false;
    if(fields)
      return fields.indexOf(k) > -1;
    if(except)
      return except.indexOf(k) == -1;
    return true;
  });

  // Get the Objects' keys
  objectKeys = Object.keys(schema._objectKeys)
    .map(k => {
      let ind = k.lastIndexOf('.$');
      return k.substring(0, ind > -1 ? ind : k.lastIndexOf('.'))
    })
    .filter(k => {
      if(fields)
        return fields.indexOf(k) > -1;
      if(except)
        return except.indexOf(k) == -1;
      return true;
    });

  return { keys, objectKeys };
};

gqlType = {};
gqlType[String] = 'String';
gqlType[Number] = 'Float';
gqlType[Boolean] = 'Boolean';
gqlType[Date] = 'String';

defaultMocks = {
  String: () => 'It works!',
  Int: () => 6,
  Float: () => 6.2,
  Boolean: () => true,
  Date: () => (new Date()).toString()
}
