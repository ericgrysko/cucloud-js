'use strict'

/**
 * Usage
 * Option 1:
 *    export CUCLOUD_PROFILE=profile-name ; node schema-export.js --out <filename.yml>
 * Option 2:
 *    node schema-export.js --profile name --out <filename.yml>
 */

var CUCloud = require('../index.js')
var log = require('npmlog')
var process = require('process')
var argv = require('minimist')(process.argv.slice(2))
var YAML = require('yamljs')
var fs = require('fs')

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
  schemaCreate: false
}

CUCloud.init({}).then((initResults) => {
  return CUCloud.getAllConfig()
}).then((allConfigObjects) => {
  return YAML.stringify(allConfigObjects, 4, 2)
}).then((yamlString) => {
  // write string to disk
  fs.writeFile(argv.out, yamlString, (err) => {
    if (err) throw err
    log.info('Export complete')
  })
})
