
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AutoOrderStack, LovableStackProps } from '../lib/auto-order-stack';

const app = new cdk.App();

// Get custom domain from context if provided
const customDomain = app.node.tryGetContext('customDomain');

// Set up stack props
const stackProps: LovableStackProps = {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
  originBasePath: 'app', // Default base path for S3 origin
};

// Add custom domain if provided
if (customDomain) {
  stackProps.customDomain = customDomain;
}

new AutoOrderStack(app, 'AutoOrderStack', stackProps);
