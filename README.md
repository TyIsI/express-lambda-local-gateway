# express-lambda-local-gateway

express-lambda-local-gateway is an Express-based local development environment for AWS Lambda functions in Node.

## Install

```
git clone git@github.com:TyIsI/express-lambda-local-gateway.git
cd express-lambda-local-gateway
npm install
```

## Running

```
npm start
```

As this is intended for live/local development, express-lambda-local-gateway uses NodeMon to monitor the lambda functions in the lambdas directory.

## Configuration

The configuration is located in config.json.

It describes the endpoints, which includes the methods and lambdas, following the model used in AWS Api Gateway, the lambdas themselves, where the handlers are specified.

The default execution options are also configured here.

Example:
```
{
    "defaults": {
        "lambda-local": {
            "profilePath": "~/.aws/credentials",
            "profileName": "default",
            "timeoutMs": 3000,
            "region": "us-west-2"
        }
    },
    "endpoints": {
        "/ping": {
            "POST": {
                "lambda": "ping"
            }
        },
        "/test": {
            "GET": {
                "lambda": "test"
            }
        }
    },
    "lambdas": {
        "ping": {
            "handler": "index.handler"
        },
        "test": {
            "handler": "index.handler"
        }
    }
}
```