# CUCloud (Node.js)

<!-- TOC depthFrom:2 depthTo:3 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Overview](#overview)
- [Usage](#usage)
- [Plugins](#plugins)
- [Examples](#examples)
	- [lambda-snshook.js](#lambda-snshookjs)
- [Future](#future)

<!-- /TOC -->
## Overview


Implementation of the [Cornell Cloud Library Spec](https://github.com/CU-CloudCollab/Cloud-Library-Spec) for JavaScript (Node.js). Intended for use on invoked scripts or deployment in AWS Lambda.

* Requires Node.js v4.3+
* DynamoDB is used to store configuration.
* Plugin based model.

## Usage

To use the module, you'll need the core DynamoDB `cucloud_configs` table.

Initialize the schema in DynamoDB...

```
# optionally fork the repos
git clone git@github.com:ericgrysko/cucloud-nodejs.git

# install the modules dependencies
cd cucloud-nodejs
npm install

# see examples/init-snshook.js
cd examples
# copy then edit prod-init-snshook.js for your use
cp init-snshook.js prod-init-snshook.js

# nodejs aws-sdk will use credentials
# required to adjust dynamodb
node prod-init-snshook.js
```

## Plugins

* `gitHubHookSns`
    ```
    var CUCloud = require('../index.js'),
        gitHubHookSns = CUCloud.plugins.gitHubHookSns;
    ```

## Examples

### lambda-snshook.js

AWS Lambda function to maintain "Amazon SNS" service hook on all repositories for a GitHub organization.

*Features*
* Rotates AWS keys on your hook when your configured access key changes.

*Required*
* oAuth Token
* SNS topic ARN
* IAM user access and secret key

---
## Future

* Use [Claudia.JS](https://github.com/claudiajs/claudia)
