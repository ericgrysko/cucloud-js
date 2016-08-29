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
    var dnsName = ''
    var zoneId = ''
    var recordType = 'CNAME'

    // Step 1 - get information about the running instance
    var promiseEc2 = getInformationOnRunningInstance(instanceId)
    promiseEc2.then(data => {
      var instanceDetail = data.Reservations[0].Instances[0]

      // sanity check if more than 1 instance
      if (data.Reservations[0].Instances.length > 1) {
        console.error(data.Reservations[0].Instances)
        return reject('lambda-cnamer does not handle more than 1 instance at a time')
      }

      // Step 1: look for cname in pluginConfig.instances
      var instanceIdx = _.findIndex(pluginConfig.instances, (instanceConfig) => { return instanceConfig.instanceId === instanceId })

      // if record found, check active status, exit quietly
      if (instanceIdx >= 0) {
        console.log('Instance found in config')
        if (!pluginConfig.instances[instanceIdx].active) {
          return resolve('InstanceId "' + instanceId + '" found, but config set to inactive')
        }

        cname = pluginConfig.instances[instanceIdx].cname
      } else {
        console.log(instanceDetail)
        console.log('Instance NOT found in config')
        for (var i = 0; i < instanceDetail.Tags.length; i++) {
          console.log(instanceDetail.Tags[ i ].Key)
          if (instanceDetail.Tags[ i ].Key === 'CNAME') {
            cname = instanceDetail.Tags[ i ].Value
          }
        }

        if (cname === '') {
          return resolve('InstanceId "' + instanceId + '" not present in config or missing CNAME tag')
        }
      }

      // Step 2: handle select of public or private dNS
      // do we have a public dns name on this instance?
      dnsName = instanceDetail.PublicDnsName

      // handle privateDnsName
      if (dnsName === '') {
        dnsName = instanceDetail.PrivateIpAddress
        recordType = 'A'
      }

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
              Type: recordType,
              ResourceRecords: [{Value: dnsName}],
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
      console.log({instanceId: instanceId, cname: cname, target: dnsName, zoneId: zoneId})
      return resolve('R53 record updated')
    }, err => {
      return reject('R53 zone update error "' + err.message + '"')
    })
  })
}
