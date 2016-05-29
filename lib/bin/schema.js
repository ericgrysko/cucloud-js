#!/usr/bin/env node
'use strict'

var process = require('process')
var program = require('commander')
var log = require('npmlog')
var fs = require('fs')
var YAML = require('yamljs')
var CUCloud = require('../../index.js')

// for handling "subcommands"
var requestedAction
var importFilename
var exportFilename
var profileName = ''

program
  .version('0.1.0')
  .description('CUCloud (Node.js) - Manage stored DynamoDB schema')
  .option('-p, --profile [profile]', 'profile name')

program
  .command('import <filename>')
  .description('Import a file to the schema')
  .action((filename) => {
    requestedAction = 'import'
    importFilename = filename
  })

program
  .command('export <filename>')
  .description('Export the schema')
  .action((filename) => {
    requestedAction = 'export'
    exportFilename = filename
  })

program
  .command('*')
  .action((env) => {
    console.error('Unsupported command "', env, '"')
    process.exit(1)
  })

program.parse(process.argv)

if (!program.args.length) program.help()

// process.env.CUCLOUD_PROFILE
if (process.env.CUCLOUD_PROFILE) {
  profileName = process.env.CUCLOUD_PROFILE
}

if (program.profile) {
  profileName = program.profile
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

if (requestedAction === 'import') {
  // read in YAML
  try {
    var nativeObject = YAML.load(importFilename)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  CUCloud.init({schemaCreate: true}).then((initResults) => {
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
} else if (requestedAction === 'export') {
  log.info('Using profileName', profileName)

  CUCloud.init({}).then((initResults) => {
    return CUCloud.getAllConfig()
  }).then((allConfigObjects) => {
    return YAML.stringify(allConfigObjects, 4, 2)
  }).then((yamlString) => {
    // write string to disk
    fs.writeFile(exportFilename, yamlString, (err) => {
      if (err) throw err
      log.info('Export complete')
    })
  })
}
