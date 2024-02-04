#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsTrainingStack } from '../lib/aws_training-stack';

const app = new cdk.App();
new AwsTrainingStack(app, 'AwsTrainingStack');
