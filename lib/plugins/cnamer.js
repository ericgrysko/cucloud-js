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

// var log = require('npmlog')
const AWS = require('aws-sdk')

cnamer.handleEvent = function (pluginConfig, lambdaEvent, lambdaContext) {
  AWS.config.region = pluginConfig.region
  AWS.config.apiVersions = {
    ec2: '2015-10-01',
    route53: '2013-04-01'
  }

  var ec2 = new AWS.EC2()
  var route53 = new AWS.Route53()

  // Step 1 - get information about the running instance
  var params = {
    DryRun: false,
    InstanceIds: [lambdaEvent.detail['instance-id']]
  }
  var requestEc2 = ec2.describeInstances(params)
  var promiseEc2 = requestEc2.promise()

  var instanceId
  var cname = ''
  var pubDnsName = ''
  var zoneId = ''

  promiseEc2.then(data => {
    var instanceDetail = data.Reservations[0].Instances[0]

    // sanity check if more than 1 instance
    if (data.Reservations[0].Instances.length > 1) {
      console.error('lambda-cnamer does not handle more than 1 instance at a time')
      console.log(data.Reservations[0].Instances)
      lambdaContext.fail(lambdaEvent)
    }

    // do we have a public dns name on this instance?
    pubDnsName = instanceDetail.PublicDnsName
    instanceId = instanceDetail.InstanceId

    // handle if the instance does not have a public IP
    if (pubDnsName === '') {
      console.log('InstanceId "' + instanceId + '" does not have public ip.')
      lambdaContext.fail(lambdaEvent)
    }

    // Step 2: look for cname in pluginConfig.instances

    // if record not found, exit quietly
    if (!Object.keys(data).length) {
      console.log('InstanceId "' + instanceId + '" not present in config')
      lambdaContext.succeed({})
    }

    // FIXME: this should be the real cname
    cname = data.Item.cname.S

    // Step 3: get list of all hosted zones to determine what is correct
    // zoneId for given cname
    var r53ZoneRequest = route53.listHostedZones()
    var r53ZonePromise = r53ZoneRequest.promise()

    return r53ZonePromise
  }, err => {
    console.log('R53 zone error "' + err.message + '"')
    console.log(err)
    lambdaContext.fail(lambdaEvent)
  }).then(data => {
    for (var i = 0; i < data.HostedZones.length; i++) {
      var hostedZone = data.HostedZones[i]
      if (cname.endsWith(hostedZone.Name)) {
        zoneId = hostedZone.Id
      }
    }

    if (zoneId === '') {
      console.log('R53 zone not found for: ' + cname)
      lambdaContext.fail(lambdaEvent)
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
    console.log('R53 zone error "' + err.message + '"')
    console.log(err)
    lambdaContext.fail(lambdaEvent)
  }).then(data => {
    console.log('R53 record updated')
    lambdaContext.succeed({instanceId: instanceId, cname: cname, target: pubDnsName, zoneId: zoneId})
  }, err => {
    console.log('R53 zone error "' + err.message + '"')
    console.log(err)
    lambdaContext.fail(lambdaEvent)
  })

  // callback(error, data);
  // return new Promise(function (resolve, reject) {
  //   console.log(lambdaEvent)
  //   console.log(pluginConfig)
  //   return resolve({success: true})
  // })
}
