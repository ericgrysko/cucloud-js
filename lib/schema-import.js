'use strict'

/**
 * Usage
 * Option 1:
 *    export CUCLOUD_PROFILE=profile-name ; node schema-import.js --schema global.yml
 * Option 2:
 *    node schema-import.js --profile name --schema global.yml
 */

var CUCloud = require('../index.js')
var log = require('npmlog')
var process = require('process')
var argv = require('minimist')(process.argv.slice(2))
var YAML = require('yamljs')

// profile name from ENV or argv
var profileName = ''

// process.env.CUCLOUD_PROFILE
if (process.env.CUCLOUD_PROFILE) {
  profileName = process.env.CUCLOUD_PROFILE
}

if (argv.profile) {
  profileName = argv.profile
}

if (!profileName) {
  console.error('A profile name is required')
  process.exit(1)
}

// configure our use of CUCloud
CUCloud.config = {
  profileName: profileName,
  schemaVersion: 1,
  schemaCreate: true
}

// read in YAML
try {
  var nativeObject = YAML.load(argv.schema)
} catch (e) {
  console.error(e)
  process.exit(1)
}

CUCloud.init({}).then((initResults) => {
  return new Promise(function (resolve, reject) {
    var promises = []

    Object.keys(nativeObject).forEach((key) => {
      var val = nativeObject[key]
      var promise = CUCloud.setPluginSettings(key, val)
      promises.push(promise)
    })

    return Promise.all(promises).then((values) => {
      return resolve({success: true})
    })
  })
}).then((response) => {
  log.verbose('Import complete')
})
