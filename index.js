'use strict';

var vogels  = require('vogels'),
    _       = require('lodash'),
    Joi     = require('joi'),
    merge   = require('merge');

var CUCloud = exports;

CUCloud.config = {
    profileName: false,
    schemaVersion: 1,
    schemaCreate: false
};

// plugins
CUCloud.plugins = {};
CUCloud.plugins.gitHubHookSns = require('./plugins/gitHubHookSns.js');

// define our DynamoDB table model
// https://github.com/hapijs/joi/blob/v8.1.0/API.md
var configTable = vogels.define('cucloud_config', {
  hashKey : 'profile',
  rangeKey : 'plugin',
  schema : {
    profile : Joi.string(),
    plugin: Joi.string(),
    settings: Joi.object()
  },
  tableName: 'cucloud_configs'
});

CUCloud.setPluginSettings = (pluginName, pluginSettings) => {
    return new Promise(function (resolve, reject) {

        var pluginConfigContent = {
            profile: CUCloud.config.profileName,
            plugin: pluginName,
            settings: pluginSettings
        };

        var pluginConfig = new configTable(pluginConfigContent);
        pluginConfig.save(function(err) {
             return resolve({});
        });
    });
}

CUCloud.getPluginSettings = (pluginName) => {
    return new Promise(function (resolve, reject) {
        // takes hash & range keys
        configTable.get(CUCloud.config.profileName, pluginName, function (err, moduleConfig) {
            var pluginSettings = moduleConfig.get('settings');
            return resolve(pluginSettings);
        });
    });
};

var confirmSchema = () => {

    if (!CUCloud.config.schemaCreate) {
        return Promise.resolve({success: null});
    }

    return new Promise(function(resolve, reject) {
        // TODO: allow the table name and capacity to be overriden by CUCloudConfig
        vogels.createTables({'cucloud_configs': {readCapacity: 1, writeCapacity: 1}}, function(err) {
            if (err) {
                // error creating tables
                reject({success: false});
            } else {
                // tables have been created
                resolve({success: true});
            }
        });
    });
};

CUCloud.init = (configOverride) => {
    // allow init to override
    CUCloud.config = merge(CUCloud.config, configOverride);

    // we can't init unless we have a proper profile name
    if (!CUCloud.config.profileName) {
        throw 'Config error: profileName is required';
    }

    console.log('Using profile "' + CUCloud.config.profileName + '"');
    console.log('Create schema: ' + CUCloud.config.schemaCreate);

    // will create tables if requested
    return confirmSchema();
};
