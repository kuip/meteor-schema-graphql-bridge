Package.describe({
  name: 'kuip:schema-graphql-bridge',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Simple Schema - GraphQL Schema Bridge',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/kuip/meteor-schema-graphql-bridge.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.4.1');
  api.use('ecmascript');
  api.mainModule('schema-graphql-bridge.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('kuip:schema-graphql-bridge');
  api.mainModule('schema-graphql-bridge-tests.js');
});
