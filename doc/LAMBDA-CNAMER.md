# lambda-cnamer.js

An AWS Lambda function to update a Route53 `CNAME` record with the public DNS of an EC2 instance when it enters a `RUNNING` state. A `CNAME` is stored in DynamoDB and the lambda function is executed by an AWS CloudWatch Rule.

## 1. Install CUCloud

0. Follow the standard installation steps defined in [README.md](../README.md).

## 2. IAM configuration

0. IAM: Create the lambda-cnamer policy. **Be sure to note the policy ARN created. You will use it later**
   ```bash
   aws iam create-policy --policy-name lambda-cnamer-policy --policy-document file://<LOCAL PATH>/lambda-cnamer-policy.json
   ```

0. IAM: Create the lambda-cnamer role with the appropriate trust policy
   ```bash
   aws iam create-role --role-name lambda-cnamer-role --assume-role-policy-document file://<LOCAL PATH>/lambda-cucloud-trust.json
   ```

0. IAM: Attach the policy to the role
   ```bash
   aws iam attach-role-policy --role-name lambda-cnamer-role --policy-arn <enter policy arn here>
   ```

## 3. Prepare ZIP with Lambda function

0. Prepare your Lambda Deployment directory:
   ```bash
   mkdir lambda-cnamer
   cd lambda-cnamer
   npm install <REPLACE-WITH-PATH-TO-YOUR-CUCLOUD-CLONE>
   # ex. npm install ~/Desktop/cucloud-js
   cp node_modules/cucloud/examples/lambda-cnamer.js index.js
   ```

0. Manually set the profile name in your lambda function **If/when AWS Lambda supports environmental variables, this step will be unnecessary.**
  ```bash
  # update your index.js
   nano index.js
   ```

0. Create the ZIP
    ```bash
    zip -r ../lambda-cnamer.zip . *
    ```

### 4. Create Lambda Function

Using the AWS Console:

0. Select Lambda -> Create a lambda function
0. Select blueprint: **Skip** (bottom of page)
0. Configure function:
   * Name: lambda-cnamer
   * Description: (whatever you want)
   * Runtime: Node.js 4.3
   * Code entry type: Upload a ZIP. Specify your lambda-cnamer.zip
   * Handler: index.handler
   * Role: use existing role (lambda-cnamer-role)
0. Click Next
0. Click "Create Function"


### 5. Create CloudWatch Event Rule

Using the AWS Console:

*Note: If you have instances launching via an ASG, use the Auto Scaling EC2 Instance Launch Successful rule*

0. Select CloudWatch -> Rules -> Create rule
0. Event selector -> Select Event Source -> `EC2 instance state change notification`
0. Specific state(s): `Running`
0. Targets -> Add Targets -> Lambda Function
0. Function: `lambda-cnamer`
0. Click "Configure details"
0. Assign a name and description, make sure State is "Enabled"
0. Click "Create Rule"

### 6. Maintain your DynamoDB Configuration

**Define your instance-id to cname map**
```yaml
plugin.cnamer:
  region: 'us-east-1'
  instances:
    -
      instanceId: 'i-0123456'
      cname: 'db-server.example.org'
      active: true
    -
      instanceId: 'i-abc1234'
      cname: 'app-server.example.org'
      active: true
```

You can then import just this portion of the schema.

```bash
cucloud-js-schema import <your-filename.yml> [--profile <set-your-profile-name>]
```

If your instanceId is not fixed due to an ASG, attach a tag with Name=CNAME and value with your cname.

If you need to modify, you can reimport or use the AWS Console to add an entry

0. Select DynamoDB -> Tables -> Select Table
0. Click the Items tab
0. Click "Create item"
0. Click the plus under instanceId
0. Click Append,String
    * Field: **cname**, String: [servername.fqdn]
0. Click Append,Boolean
    * Field: **active**, Boolean: true/false
0. Click Save

### Testing

Be sure to use an instance that has receives a *public* IP when it enters `RUNNING` state.
