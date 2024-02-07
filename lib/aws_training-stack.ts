import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { EventBus } from 'aws-cdk-lib/aws-events';

export class AwsTrainingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 👇 Defining our Event Bus
    const eventBus = new EventBus(this, "eventBus", {
      eventBusName: "isaac-event-bus",
    });
  }
}
