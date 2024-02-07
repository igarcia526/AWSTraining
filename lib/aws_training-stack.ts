import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { EventBus } from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';


export class AwsTrainingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 👇 Defining our Event Bus
    const eventBus = new EventBus(this, "eventBus", {
      eventBusName: "isaac-event-bus",
    });

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'index.handler'                // file is "hello", function is "handler"
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    const api = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: hello,
      proxy: false,
    });

    const items = api.root.addResource('items');
    items.addMethod('GET');  // GET /items

    const software = api.root.addResource('software');
    software.addMethod('GET');  // GET /items
  }
}
