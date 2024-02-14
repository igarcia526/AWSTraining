import { Duration, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { AwsIntegration, IRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import * as events from 'aws-cdk-lib/aws-events';

export class AwsTrainingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

     // Define the event bus
    const eventBus = new events.EventBus(this, 'eventBus', { eventBusName: 'isaacs-event-bus' });

     // Define Lambda
    const numberGeneratorHandler = new NodejsFunction(this, 'isaacs-event-lambda', {
      runtime: Runtime.NODEJS_16_X,
      entry: 'lib/service/runtime/index.js',
      handler: 'handler',
      timeout: Duration.seconds(30),
      environment: {
        EVENT_BUS_ARN: eventBus.eventBusArn,
      },
    });

    // 👇 Define a rule for the event bus to trigger the odd number processor lambda
    // why we use as any[] --> https://github.com/aws/aws-cdk/issues/20486

    const Rule = new events.Rule(this, 'isaac-event-rule', {
      eventBus,
      eventPattern: {
      source: [{ prefix: 'com.majestic.orders' }] as any[],
      },
    }).addTarget(new LambdaFunction(numberGeneratorHandler));

    // 👇 creating role as mentioned : https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_iam-readme.html
    //  👇 this also creates the EventBridge policy that will allow the service to PutEvents to the event bus 

    const credentialsRole = new Role(this, 'Izzys-API-Role', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    credentialsRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [eventBus.eventBusArn],
        actions: ['events:PutEvents'],
      })
    );

    const api  = new apigateway.RestApi(this, 'izzy-api', {
      description: "I just created this"
    });

    const eventbridgeIntegration = new AwsIntegration({
      service: 'events',
      action: 'PutEvents',
      integrationHttpMethod: 'POST',
      options: {
        credentialsRole: credentialsRole,
        requestTemplates: {
          'application/json': `
            #set($context.requestOverride.header.X-Amz-Target ="AWSEvents.PutEvents")
            #set($context.requestOverride.header.Content-Type ="application/x-amz-json-1.1")
            ${JSON.stringify({
              Entries: [
                {
                  DetailType: 'putEvent',
                  Detail: "$util.escapeJavaScript($input.json('$'))",
                  Source: 'com.majestic.orders',
                  EventBusName: eventBus.eventBusArn,
                },
              ],
            })}
          `,
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': JSON.stringify({
                id: "$input.path('$.Entries[0].EventId')",
              }),
            },
          },
        ],
      },
    });

    const resource = api.root.addResource('orders');
    resource.addMethod('POST', eventbridgeIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    // --------------------------------------------------------------------- End of example ---------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------------------------------------------------*/
  }
}
