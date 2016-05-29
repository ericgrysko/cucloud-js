# CUCloud (Node.js)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

<!-- TOC depthFrom:2 depthTo:4 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Overview](#overview)
- [Getting Started](#getting-started)
	- [Install](#install)
	- [AWS Credentials](#aws-credentials)
	- [Initialize Schema](#initialize-schema)
	- [Export Schema](#export-schema)
- [Plugins](#plugins)
- [Examples](#examples)
- [Future](#future)

<!-- /TOC -->
## Overview

CUCloud (Node.js) is an implementation of the [Cornell Cloud Library Spec](https://github.com/CU-CloudCollab/Cloud-Library-Spec). It is designed for use with invoked scripts or deployment in AWS Lambda.

* Requires Node.js v4.3+
* Uses AWS DynamoDB to store configuration.
* Extensible plugin based model.

## Getting Started

CUCloud (Node.js) uses the [AWS SDK for JavaScript](https://www.npmjs.com/package/aws-sdk) and stores configuration in a DynamoDB table named `cucloud_config`. Before using the module with any plugins, you'll need to initialize the schema. For details about the schema, see [SCHEMA.md](doc/SCHEMA.md).

### Install

CUCloud (Node.js) is not available via [npm](https://www.npmjs.com/), but you can install it locally for yourself.

```bash
# fork, then clone the repository from your account
git clone git@github.com:<YOURUSERNAME>/cucloud-js.git

# install the modules dependencies
cd cucloud-js
npm install

# install the module globally for yourself
npm install . -g
npm link
```

### AWS Credentials

Review [Setting AWS Credentials](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials) before initializing the schema. When invoking the module, you will need access to DynamoDB be via your IAM user or a role.

*Broad IAM policy:*
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Initialize Schema

Initialize the DynamoDB schema using the model defined in `examples/schema.yml`

```bash
# use environmental variable or set the profile at runtime
export CUCLOUD_PROFILE=<profile-name>

# import the schema
cucloud-js-schema import examples/schema.yml [--profile <profile-name> ]
```

### Export Schema

If at any point you would like to export your schema you can dump the configuration in YAML format. You can later import this export as needed.

```bash
# use environmental variable CUCLOUD_PROFILE= or set the profile at runtime
cucloud-js-schema export examples/prod-schema-export.yml [--profile <profile-name> ]
```

## Plugins

CUCloud (Node.js) is designed to be used with plugins.

* `CUCloud.plugins.cnamer` -
* `CUCloud.plugins.gitHubHookSns` -

## Examples

Implementations of the plugins are included in `examples/`. Documentation is included in `doc/`.

* `examples/lambda-cnamer.js` - An AWS Lambda function to update a Route53 CNAME record with the public DNS of an EC2 instance when it enters a RUNNING state. For more detail see [LAMBDA-CNAMER.md](doc/LAMBDA-CNAMER.md).
* `examples/lambda-snshook.js` - AWS Lambda function to maintain the "Amazon SNS" service hook on all repositories for a GitHub organization. For more detail see [LAMBDA-SNSHOOK.md](doc/LAMBDA-SNSHOOK.md).

---

## Future

Future features under consideration...

* expanded command line management of configuration.
* schema export/import should be first level methods of CUCloud
* options to reserve namespace
* Expand out of the box environmental variable support.
* Potential integrate with [Claudia.JS](https://github.com/claudiajs/claudia)
