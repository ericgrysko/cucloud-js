# Schema

**Experimental**

An individual item in [http://json-schema.org/](http://json-schema.org/)

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "profile": {
      "type": "string"
    },
    "plugin": {
      "type": "string"
    },
    "settings": {
      "type": "object",
      "properties": {
      },
      "required": [
      ]
    },
  },
  "required": [
    "profile",
    "plugin",
    "settings"
  ]
}    
```

#### Example

The data stored for the sns-hook plugin.

```json
{
  "profile": "ssit-sb",
  "plugin": "sns-hook",
  "settings": {
    "gitHubOrgName": "organization-name",
    "oAuthToken": "abc123",
    "snsHook": {
      "name": "amazonsns",
      "config": {
        "aws_key": "",
        "aws_secret": "",
        "sns_topic": ""
      },
      "events": ["push"],
      "active": true
    }
  }
}
```
