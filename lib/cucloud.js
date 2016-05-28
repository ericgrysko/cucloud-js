'use strict'

var vogels = require('vogels')
var Joi = require('joi')
var merge = require('merge')
var log = require('npmlog')

var CUCloud = exports

CUCloud.config = {
  profileName: false,
  schemaVersion: 1,
  schemaCreate: false
}

// plugins
CUCloud.plugins = {}
CUCloud.plugins.gitHubHookSns = require('./plugins/gitHubHookSns.js')

// define our DynamoDB table model
// https://github.com/hapijs/joi/blob/v8.1.0/API.md
var ConfigTable = vogels.define('cucloud_config', {
  hashKey: 'profile',
  rangeKey: 'plugin',
  schema: {
    profile: Joi.string(),
    plugin: Joi.string(),
    settings: Joi.object()
  },
  tableName: 'cucloud_config'
})

CUCloud.setPluginSettings = (pluginName, pluginSettings) => {
  return new Promise(function (resolve, reject) {
    var pluginConfigContent = {
      profile: CUCloud.config.profileName,
      plugin: pluginName,
      settings: pluginSettings
    }

    var pluginConfig = new ConfigTable(pluginConfigContent)
    pluginConfig.save(function (err) {
      if (err) log.error('Encountered error')
      return resolve({})
    })
  })
}

CUCloud.getPluginSettings = (pluginName) => {
  return new Promise(function (resolve, reject) {
    // takes hash & range keys
    ConfigTable.get(CUCloud.config.profileName, pluginName, function (err, moduleConfig) {
      if (err) log.error('Encountered error')
      var pluginSettings = moduleConfig.get('settings')
      return resolve(pluginSettings)
    })
  })
}

var confirmSchema = () => {
  if (!CUCloud.config.schemaCreate) {
    return Promise.resolve({
      success: null
    })
  }

  return new Promise(function (resolve, reject) {
    // TODO: allow the table name and capacity to be overriden by CUCloudConfig
    vogels.createTables({
      'cucloud_config': {
        readCapacity: 1,
        writeCapacity: 1
      }
    }, function (err) {
      if (err) {
        // error creating tables
        reject({success: false})
      } else {
        // tables have been created
        resolve({success: true})
      }
    })
  })
}

CUCloud.init = (configOverride) => {
  // allow init to override
  CUCloud.config = merge(CUCloud.config, configOverride)

  // we can't init unless we have a proper profile name
  if (!CUCloud.config.profileName) {
    throw new Error('Config error: profileName is required')
  }

  log.verbose('Using profile "' + CUCloud.config.profileName + '"')
  log.verbose('Create schema: ' + CUCloud.config.schemaCreate)

  // will create tables if requested
  return confirmSchema()
}
