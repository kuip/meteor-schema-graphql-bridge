// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by schema-graphql-bridge.js.
import { name as packageName } from "meteor/kuip:schema-graphql-bridge";

// Write your tests here!
// Here is an example.
Tinytest.add('schema-graphql-bridge - example', function (test) {
  test.equal(packageName, "schema-graphql-bridge");
});
