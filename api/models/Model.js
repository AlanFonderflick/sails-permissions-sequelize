/**
 * @module Model
 *
 * @description
 *   Abstract representation of a Waterline Model.
 */
module.exports = {
    description: 'Represents a Waterline collection that a User can create, query, etc.',

    autoPK: true,
    autoCreatedBy: false,
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        identity: {
            type: Sequelize.STRING,
            notNull: true
        },
        attributes: {
            type: Sequelize.JSON
        }
        // permissions: {
        //   collection: 'Permission',
        //   via: 'model'
        // },        
    },
    associate: function(){
        Model.hasMany(Permissions, {as: 'permissions'});
    },
    options: {
        tableName: 'model',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }
};
