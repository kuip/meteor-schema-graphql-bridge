export default SchemaBridge = {
  schema: (schema, { fields, name, except }={}) => {
    const S = schema._schema;
    let k, content, objs;

    k = getFields({schema, fields, except});
    //console.log(JSON.stringify(k))
    content = k.keys.map(k => {
      return getFieldSchema(S, k);
    });
    content = content.reduce((a,b) => `${a}${b}`);


    if(!name)
      return content;

    return `
      type ${name} {
        ${content}
      }
    `;
  },
  resolvers: (schema, { fields, name, except } = {}) => {
    const S = schema._schema;
    let k = getFields({schema, fields, except});
    let res = {};
    k.keys.forEach(k => {
      res[k] = function(root, args, context) {
        return root[k];
      };
    });
    if(!name)
      return res;
    
    let n = {};
    n[name] = res;
    return n;
  },
  mocks: (schema, { fields, name, except } = {}) => {
    const S = schema._schema;
    let k = getFields({schema, fields, except}),
      mocks = {};
    k.keys.forEach(k => {
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

const getFieldSchema = (S, k) => {
  if(S[k].type == Array && S[`${k}.$`])
    return `
    ${k}: [${gqlType[S[`${k}.$`].type]}]
  `;

  return `
    ${k}: ${gqlType[S[k].type]}
  `;
}


const getFields = ({schema, fields, except=[]}) => {
  const S = schema._schema;
  let keys, objectKeys;

  if(fields && !fields.length)
    fields = null;
  if(except && !except.length)
    except = null;

  // Get firstLevelKeys, no Objects
  keys = schema._firstLevelSchemaKeys.filter(k => {
    if(S[k].type == Object)
      return false;
    if(fields)
      return fields.indexOf(k) > -1;
    if(except)
      return except.indexOf(k) == -1;
    return true;
  });

  // Get the Objects
  objectKeys = Object.keys(schema._objectKeys)
    .map(k => k.substring(0, k.lastIndexOf('.')))
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
