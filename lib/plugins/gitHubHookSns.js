'use strict';

var hookSns = exports;

hookSns.pluginName = 'sns-hook';

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
};

var GitHub = require('github-api');

var postHookUpdateCallback = function(err, data) {
    return;
};

var postHookCreateCallback = function(err, data) {
    return;
};

var updateHooksOnRepositoryNamed = function(gh, organizationName, repositoryName, snsHookConfig) {
    var repository = gh.getRepo(organizationName, repositoryName);

    repository.listHooks(function(err, hooks) {
        var snsHookExists = false;
        var snsHookNeedsUpdate = false;
        var snsHookId = false;

        for (var h = 0; h < hooks.length; h++) {
            var hook = hooks[h];
            if (hook.name == 'amazonsns') {
                snsHookExists = true;
                snsHookId =  hook.id;
                if (hook.config.aws_key != snsHookConfig.config.aws_key ||
                    (hook.active != snsHookConfig.active)) {
                    snsHookNeedsUpdate = true;
                }
            }
        }

        if (!snsHookExists) {
            console.log('Create hook on ' + repositoryName);
            repository.createHook(snsHookConfig, postHookUpdateCallback);

        } else if (snsHookNeedsUpdate) {
            console.log('Update hook on ' + repositoryName);
            repository.updateHook(snsHookId, snsHookConfig, postHookCreateCallback);

        } else {
            console.log('Hook exists and does not need update on ' + repositoryName);
        }
    });
};

hookSns.updateAll = function(pluginConfig) {

    return new Promise(function(resolve, reject) {

        var gh = new GitHub({token: pluginConfig.oAuthToken});

        var gitOrganization = gh.getOrganization(pluginConfig.gitHubOrgName);

        gitOrganization.getRepos().then(function(httpResponse) {
            for (var i = 0; i < httpResponse.data.length; i++) {
                var repositoryName = httpResponse.data[i].name;

                console.log(repositoryName);
                // FIXME/DEBUG: async issue
                //updateHooksOnRepositoryNamed(gh, pluginConfig.gitHubOrgName, repositoryName, pluginConfig.snsHook);
            }
            return resolve({});
        });
    });
};
