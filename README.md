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

To use the module with any plugins, you'll need the core DynamoDB `cucloud_config` table. The structure of data is defined in [SCHEMA.md](SCHEMA.md).


## Getting Started

Initialize the DynamoDB schema using the schema defined in `examples/schema.yml`

```bash
# nodejs aws-sdk will use credentials, required to adjust dynamodb

# fork the repository
git clone git@github.com:<YOURUSERNAME>/cucloud-js.git

# install the modules dependencies
cd cucloud-js
npm install

# Option 1: Use environmental variable
export CUCLOUD_PROFILE=<set-your-profile-name>
node lib/schema-import.js --schema examples/schema.yml

# Option 2: set the profile name at run time
node lib/schema-import.js --profile <set-your-profile-name> --schema examples/schema.yml
```

If at any point you would like to export your schema you can:

```bash
node lib/schema-export.js --profile <set-your-profile-name> --out examples/prod-schema-export.yml
```

## Plugins

CUCloud (Node.js) is designed to be used with plugins.

* `CUCloud.plugins.gitHubHookSns` -

  ```
  var CUCloud = require('../index.js')
  var gitHubHookSns = CUCloud.plugins.gitHubHookSns
  ```

* `CUCloud.plugins.template` - placeholder


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

* expanded command line management of configuration.
* schema export/import should be first level methods of CUCloud
* options to reserve namespace
* Expand out of the box environmental variable support.
* Potential integrate with [Claudia.JS](https://github.com/claudiajs/claudia)
