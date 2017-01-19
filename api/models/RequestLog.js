/**
* RequestLog.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  autoPK: false,
  autoCreatedBy: false,
  autoUpdatedAt: false,

    attributes: {
        id: {
          type: Sequelize.STRING,
          primaryKey: true
        },
        ipAddress: {
          type: Sequelize.STRING
        },
        method: {
          type: Sequelize.STRING
        },
        url: {
          type: Sequelize.STRING,
          validate: { isUrl: true }
        },
        body: {
          type: Sequelize.JSON
        },
        // user: {
        //   model: 'User'
        // },
        model: {
          type: Sequelize.STRING
        }
    },
    associate: function(){
        RequestLog.hasOne(User)
    },
    options: {
        tableName: 'requestlog',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }

};
