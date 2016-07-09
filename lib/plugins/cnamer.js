'use strict'

var cnamer = exports

cnamer.pluginName = 'plugin.cnamer'

// default configuration
cnamer.settingsDefault = {
  settings: {
    region: 'us-east-1',
    instances: [{
      instanceId: 'i-0123456',
      cname: 'example.org',
      active: true
    }]
  }
}

const AWS = require('aws-sdk')
var log = require('npmlog')
var _ = require('lodash')

cnamer.updateCname = (pluginConfig, instanceId) => {
  return new Promise((resolve, reject) => {
    if (!pluginConfig.instances.length) {
      return resolve('Configuration defines no instances to cname for')
    }

    AWS.config.region = pluginConfig.region
    AWS.config.apiVersions = {
      ec2: '2015-10-01',
      route53: '2013-04-01'
    }

    log.verbose('Using region ' + pluginConfig.region)

    var ec2 = new AWS.EC2()
    var route53 = new AWS.Route53()

    var getInformationOnRunningInstance = (instanceId) => {
      var params = {
        DryRun: false,
        InstanceIds: [instanceId]
      }
      var requestEc2 = ec2.describeInstances(params)
      return requestEc2.promise()
    }

    var cname = ''
    var pubDnsName = ''
    var zoneId = ''

    // Step 1 - get information about the running instance
    var promiseEc2 = getInformationOnRunningInstance(instanceId)
    promiseEc2.then(data => {
      var instanceDetail = data.Reservations[0].Instances[0]

      // sanity check if more than 1 instance
      if (data.Reservations[0].Instances.length > 1) {
        console.error(data.Reservations[0].Instances)
        return reject('lambda-cnamer does not handle more than 1 instance at a time')
      }

      // do we have a public dns name on this instance?
      pubDnsName = instanceDetail.PublicDnsName

      // reject if the instance does not have a public IP
      if (pubDnsName === '') {
        return reject('InstanceId "' + instanceId + '" does not have public ip.')
      }

      // Step 2: look for cname in pluginConfig.instances
      var instanceIdx = _.findIndex(pluginConfig.instances, (instanceConfig) => { return instanceConfig.instanceId === instanceId })

      // if record not found, exit quietly
      if (instanceIdx < 0) {
        return resolve('InstanceId "' + instanceId + '" not present in config')
      }

      if (!pluginConfig.instances[instanceIdx].active) {
        return resolve('InstanceId "' + instanceId + '" found, but config set to inactive')
      }

      cname = pluginConfig.instances[instanceIdx].cname

      // Step 3: get list of all hosted zones to determine what is correct
      // zoneId for given cname
      var r53ZoneRequest = route53.listHostedZones()
      var r53ZonePromise = r53ZoneRequest.promise()

      return r53ZonePromise
    }, err => {
      console.error('EC2 Error' + err.message)
      return reject('EC2 error "' + err.message + '"')
    }).then(data => {
      for (var i = 0; i < data.HostedZones.length; i++) {
        var hostedZone = data.HostedZones[i]
        if (cname.endsWith('.' + hostedZone.Name)) {
          zoneId = hostedZone.Id
        }
      }

      if (zoneId === '') {
        return reject('R53 zone not found for: ' + cname)
      }

      // Step 4: update r53
      var params53 = {
        ChangeBatch: {
          Changes: [{
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: cname,
              Type: 'CNAME',
              ResourceRecords: [{Value: pubDnsName}],
              TTL: 60
            }
          }]
        },
        HostedZoneId: zoneId
      }

      var r53RecordRequest = route53.changeResourceRecordSets(params53)
      var r53RecordPromise = r53RecordRequest.promise()

      return r53RecordPromise
    }, err => {
      return reject('R53 list zone error "' + err.message + '"')
    }).then(data => {
      console.log({instanceId: instanceId, cname: cname, target: pubDnsName, zoneId: zoneId})
      return resolve('R53 record updated')
    }, err => {
      return reject('R53 zone update error "' + err.message + '"')
    })
  })
}
