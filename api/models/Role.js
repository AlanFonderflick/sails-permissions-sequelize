/**
 * @module Role
 *
 * @description
 *   Roles endow Users with Permissions. Exposes Postgres-like API for
 *   resolving granted Permissions for a User.
 *
 * @see <http://www.postgresql.org/docs/9.3/static/sql-grant.html>
 */
module.exports = {
    autoCreatedBy: false,

    description: 'Confers `Permission` to `User`',

    attributes: {
        name: {
          type: Sequelize.STRING,
          index: true,
          notNull: true,
          unique: true
        },
        // users: {
        //   collection: 'User',
        //   via: 'roles'
        // },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // permissions: {
        //   collection: 'Permission',
        //   via: 'role'
        // }
    },
    associate: function(){
        Role.belongsToMany(User, {through: 'userroles',as: 'users'});
        Role.hasMany(Permission, {as: 'permissions'});
    },
    indexes: [
        {
          fields: ['active']
        },
    ],
    options: {
        tableName: 'role',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }
};
