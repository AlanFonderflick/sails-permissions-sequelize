module.exports = require('sails-generate-entities')({
  module: 'sails-permissions-sequelize',
  id: 'permissions-api',
  statics: [
    'config/permissions.js'
  ],
});
