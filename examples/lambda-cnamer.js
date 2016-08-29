'use strict'

var CUCloud = require('cucloud')
var cnamer = CUCloud.plugins.cnamer

// configure our use of CUCloud
CUCloud.config = {
  profileName: 'ssit-sb',
  schemaVersion: 1,
  schemaCreate: false
}

exports.handler = (event, context, callback) => {
  // init allows passing overrides
  return CUCloud.init({}).then((initResults) => {
    return CUCloud.getPluginSettings(cnamer.pluginName)
  }, (reason) => {
    context.fail(reason)
  }).then((pluginSettings) => {
    // pull the instance information out of the event
    var instanceId = ''
    instanceId = event.detail['instance-id']
    if (typeof instanceId === 'undefined' || instanceId === '') {
      instanceId = event.detail.EC2InstanceId
    }

    return cnamer.updateCname(pluginSettings, instanceId)
  }, (reason) => {
    console.log(reason)
    context.fail(reason)
  }).then((pluginResults) => {
    console.log(pluginResults)
    callback(null, 'complete')
    context.succeed({})
  }, (reason) => {
    console.log(reason)
    context.fail(reason)
  })
}
