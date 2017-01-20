var permissionPolicies = [
  'passport',
  'sessionAuth',
  'ModelPolicy',
  'OwnerPolicy',
  'PermissionPolicy',
  'RolePolicy'
]
import path from 'path'
import _ from 'lodash'
import Marlinspike from 'marlinspike'
// import models from './dist/api/models'

class Permissions extends Marlinspike {
  constructor (sails) {
    super(sails, module)
  }

  configure () {
    if (!_.isObject(sails.config.permissions)) sails.config.permissions = { }

    /**
     * Local cache of Model name -> id mappings to avoid excessive database lookups.
     */
    this.sails.config.blueprints.populate = false

    // let hook = this;
    // hook.initModels()
    // var connection, migrate, sequelize;
    // sails.log.verbose('Using connection named ' + sails.config.models.connection);
    // connection = sails.config.connections[sails.config.models.connection];
    // if (connection == null) {
    //   throw new Error('Connection \'' + sails.config.models.connection + '\' not found in config/connections');
    // }
    // if (connection.options == null) {
    //   connection.options = {};
    // }
    // connection.options.logging = connection.options.logging || sails.log.verbose; //A function that gets executed everytime Sequelize would log something.
    //
    //  migrate = sails.config.models.migrate;
    // sails.log.verbose('Migration: ' + migrate);
    //
    // if (connection.url) {
    //   sequelize = new Sequelize(connection.url, connection.options);
    // } else {
    //   sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
    // }
    // global['sequelize'] = sequelize;
    //
    //   var modelDef, modelName, ref;
    //   if (err != null) {
    //     return next(err);
    //   }
    //   for (modelName in models) {
    //     modelDef = models[modelName];
    //     sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
    //     global[modelDef.globalId] = global['sequelize'].define(modelDef.globalId, modelDef.attributes, modelDef.options);
    //     _.extend(global[modelDef.globalId], modelDef);
    //     sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
    //   }
    //
    //   for (modelName in models) {
    //     modelDef = models[modelName];
    //
    //     hook.setAssociation(modelDef);
    //     hook.setDefaultScope(modelDef);
    //   }
    //
    //   if(migrate === 'safe') {
    //     return next();
    //   } else {
    //     var forceSync = migrate === 'drop';
    //     global['sequelize'].sync({ force: forceSync }).then(function() {
    //       return next();
    //     });
    //   }

 }

  initModels () {
    if(sails.models === undefined) {
      sails.models = {};
    }
  }

  setAssociation (modelDef) {
    if (modelDef.associations != null) {
      sails.log.verbose('Loading associations for \'' + modelDef.globalId + '\'');
      if (typeof modelDef.associations === 'function') {
        modelDef.associations(modelDef);
      }
    }
  }

  setDefaultScope (modelDef) {
    if (modelDef.defaultScope != null) {
      sails.log.verbose('Loading default scope for \'' + modelDef.globalId + '\'');
      var model = global[modelDef.globalId];
      if (typeof modelDef.defaultScope === 'function') {
        var defaultScope = modelDef.defaultScope() || {};
        model.addScope('defaultScope',defaultScope,{override: true});
      }
    }
  }

  initialize (next) {
    let config = this.sails.config.permissions

    this.installModelOwnership()
    this.sails.after(config.afterEvent, () => {
      if (!this.validateDependencies()) {
        this.sails.log.error('Cannot find sails-auth hook. Did you "npm install sails-auth --save"?')
        this.sails.log.error('Please see README for installation instructions: https://github.com/tjwebb/sails-permissions')
        return this.sails.lower()
      }

      if (!this.validatePolicyConfig()) {
        this.sails.log.warn('One or more required policies are missing.')
        this.sails.log.warn('Please see README for installation instructions: https://github.com/tjwebb/sails-permissions')
      }

    })

    this.sails.after('hook:sequelize:loaded', () => {
        //TO CHANGE
      sails.models.model.count()
        .then(count => {
          if (count === _.keys(this.sails.models).length) return next()

          return this.initializeFixtures()
            .then(() => {
              next()
            })
        })
        .catch(error => {
          this.sails.log.error(error)
          next(error)
        })
    })
  }

  validatePolicyConfig () {
    var policies = this.sails.config.policies
    return _.all([
      _.isArray(policies['*']),
      _.intersection(permissionPolicies, policies['*']).length === permissionPolicies.length,
      policies.AuthController && _.contains(policies.AuthController['*'], 'passport')
    ])
  }

  installModelOwnership () {
    var models = this.sails.models
    if (this.sails.config.models.autoCreatedBy === false) return

    _.each(models, model => {
      if (model.autoCreatedBy === false) return

      _.defaults(model.attributes, {
        createdBy: {
          model: 'User',
          index: true
        },
        owner: {
          model: 'User',
          index: true
        }
      })
    })
  }

  /**
  * Install the application. Sets up default Roles, Users, Models, and
  * Permissions, and creates an admin user.
  */
  initializeFixtures () {
    let fixturesPath = path.resolve(__dirname, '../../../config/fixtures/')
    return require(path.resolve(fixturesPath, 'model')).createModels()
      .then(models => {
        this.models = models
        this.sails.hooks.permissions._modelCache = _.indexBy(models, 'identity')

        return require(path.resolve(fixturesPath, 'role')).create()
      })
      .then(roles => {
        this.roles = roles
        var userModel = _.find(this.models, { name: 'User' })
        return require(path.resolve(fixturesPath, 'user')).create(this.roles, userModel)
      })
      .then(() => {
        return sails.models.user.findOne({ email: this.sails.config.permissions.adminEmail })
      })
      .then(user => {
        this.sails.log('sails-permissions: created admin user:', user)
        user.createdBy = user.id
        user.owner = user.id
        return user.save()
      })
      .then(admin => {
        return require(path.resolve(fixturesPath, 'permission')).create(this.roles, this.models, admin, this.sails.config.permissions);
      })
      .catch(error => {
        this.sails.log.error(error)
      })
  }

  validateDependencies () {
    return !!this.sails.hooks.auth;
  }
}

export default Marlinspike.createSailsHook(Permissions)
