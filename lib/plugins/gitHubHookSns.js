'use strict'

var hookSns = exports

hookSns.pluginName = 'sns-hook'

// default configuration
hookSns.settingsDefault = {
  profile: '',
  plugin: '',
  settings: {
    gitHubOrgName: 'OrganizationName',
    oAuthToken: 'hash',
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
}

var GitHub = require('github-api')
var log = require('npmlog')

var postHookUpdateCallback = function (err, data) {
  if (err) log.error('Encountered error')
  return
}

var postHookCreateCallback = function (err, data) {
  if (err) log.error('Encountered error')
  return
}

var updateHooksOnRepositoryNamed = function (gh, organizationName, repositoryName, snsHookConfig) {
  var repository = gh.getRepo(organizationName, repositoryName)

  return repository.listHooks(function (err, hooks) {
    var snsHookExists = false
    var snsHookNeedsUpdate = false
    var snsHookId = false
    var hookPromise

    // FIXME: handle this as an error differently
    if (err) {
      log.error('Unable to list hooks on ' + repositoryName)
      return Promise.resolve({success: null})
    }

    for (var h = 0; h < hooks.length; h++) {
      var hook = hooks[h]
      if (hook.name === 'amazonsns') {
        snsHookExists = true
        snsHookId = hook.id
        if (hook.config.aws_key !== snsHookConfig.config.aws_key || (hook.active !== snsHookConfig.active)) {
          snsHookNeedsUpdate = true
        }
      }
    }

    if (!snsHookExists) {
      log.info('Create hook on ' + repositoryName)
      hookPromise = repository.createHook(snsHookConfig, postHookUpdateCallback)
    } else if (snsHookNeedsUpdate) {
      log.info('Update hook on ' + repositoryName)
      hookPromise = repository.updateHook(snsHookId, snsHookConfig, postHookCreateCallback)
    } else {
      log.info('Hook exists and does not need update on ' + repositoryName)
      hookPromise = Promise.resolve({success: null})
    }

    return hookPromise
  })
}

hookSns.updateAll = function (pluginConfig) {
  return new Promise(function (resolve, reject) {
    var gh = new GitHub({
      token: pluginConfig.oAuthToken
    })

    var gitOrganization = gh.getOrganization(pluginConfig.gitHubOrgName)

    return gitOrganization.getRepos().then(function (httpResponse) {
      var promises = []
      var repoPromise
      for (var i = 0; i < httpResponse.data.length; i++) {
        var repositoryName = httpResponse.data[i].name

        log.verbose(repositoryName)
        repoPromise = updateHooksOnRepositoryNamed(gh, pluginConfig.gitHubOrgName, repositoryName, pluginConfig.snsHook)
        promises.push(repoPromise)
      }

      return Promise.all(promises).then(function (values) {
        return resolve({})
      })
    })
  })
}
