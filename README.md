# CUCloud (Node.js)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
<!-- TOC depthFrom:2 depthTo:3 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Overview](#overview)
- [Schema](#schema)
- [Getting Started](#getting-started)
- [Plugins](#plugins)
- [Examples](#examples)
	- [lambda-snshook.js](#lambda-snshookjs)
- [Future](#future)

<!-- /TOC -->

## Overview

Implementation of the [Cornell Cloud Library Spec](https://github.com/CU-CloudCollab/Cloud-Library-Spec) for JavaScript (Node.js). For use with invoked scripts or deployment in AWS Lambda.

* Requires Node.js v4.3+
* AWS DynamoDB is used to store configuration.
* Plugin based model.

## Schema

To use the module with any plugins, you'll need the core DynamoDB `cucloud_config` table. The structure of data is defined in [SCHEMA.md](SCHEMA.MD).

## Getting Started

Initialize the schema in DynamoDB...

```bash
# nodejs aws-sdk will use credentials, required to adjust dynamodb

# fork the repository
git clone git@github.com:<YOURUSERNAME>/cucloud-js.git

# install the modules dependencies
cd cucloud-js
npm install

# Option 1: Use environmental variable
export CUCLOUD_PROFILE=<set-your-profile-name>
node lib/init-schema.js

# Option 2: set the profile name at run time
node lib/init-schema.js --profile <set-your-profile-name>
```

## Plugins

CUCloud (Node.js) is designed to be used with plugins.

* `CUCloud.plugins.gitHubHookSns` -
  ```
  var CUCloud = require('../index.js')
  var gitHubHookSns = CUCloud.plugins.gitHubHookSns
  ```


## Examples

### lambda-snshook.js

AWS Lambda function using `CUCloud.plugins.gitHubHookSns` to maintain "Amazon SNS" service hook on all repositories for a GitHub organization.

*Features*
* Rotates AWS keys on your hook when your configured access key changes.

*Required*
* oAuth Token
* SNS topic ARN
* IAM user access and secret key

#### Usage

```bash
# see examples/init-snshook.js
cd examples

# copy then edit prod-init-snshook.js for your use
cp init-snshook.js prod-init-snshook.js

node prod-init-snshook.js
```
---

## Future

Future features under consideration...

* globally reserved namespaces
  * aws.global.property
* Expanded command line management of configuration.
* YAML import/export of configuration
* Environmental variable support out of the box.
* Potential integrate with [Claudia.JS](https://github.com/claudiajs/claudia)
