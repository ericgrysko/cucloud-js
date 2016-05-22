'use strict'

var CUCloud = require('../index.js')
var gitHubHookSns = CUCloud.plugins.gitHubHookSns
var log = require('npmlog')

// configure our use of CUCloud
CUCloud.config = {
  profileName: 'ssit-sb',
  schemaVersion: 1,
  schemaCreate: true
}

// define your gitHubHookSns plugin settings - this will be stored in DynamoDB
// oAuthToken: valid oAuth Token on GitHub org, requires scopes: repo, admin:repo_hook
// gitHubOrgName: name of organization
// snsHook: format compatible with https://developer.github.com/v3/repos/hooks/#create-a-hook
var pluginSettings = {
  gitHubOrgName: 'YOURORGNAME',
  oAuthToken: '',
  snsHook: {
    name: 'amazonsns',
    config: {
      aws_key: '',
      aws_secret: '',
      sns_topic: ''
    },
    events: ['push'],
    active: true
  }
}

CUCloud.init({}).then((initResults) => {
  return CUCloud.setPluginSettings(gitHubHookSns.pluginName, pluginSettings)
}).then(() => {
  log.info('Complete')
})
