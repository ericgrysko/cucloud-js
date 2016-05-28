'use strict'

/**
 * Usage
 * export CUCLOUD_PROFILE=name   OR   node init-schema.js --profile name
 */

var CUCloud = require('../index.js')
var log = require('npmlog')
var process = require('process')
var argv = require('minimist')(process.argv.slice(2))

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

log.info('Using profile name: "' + profileName + '"')

// configure our use of CUCloud
CUCloud.config = {
  profileName: profileName,
  schemaVersion: 1,
  schemaCreate: true
}

CUCloud.init({}).then((initResults) => {
  log.verbose(initResults)
  log.info('Complete')
})
