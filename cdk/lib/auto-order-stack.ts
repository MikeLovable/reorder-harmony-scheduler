
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class AutoOrderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function that will handle API requests
    const autoOrderFunction = new lambda.Function(this, 'AutoOrderFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk'],
        nodeModules: [],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [
              // Copy the UI project types and algorithm files needed by the Lambda
              `cp -r ${path.join(inputDir, '../src/types')} ${outputDir}/src/`,
              `cp -r ${path.join(inputDir, '../src/utils/lookAhead*.ts')} ${outputDir}/src/utils/`,
              `cp -r ${path.join(inputDir, '../src/utils/dataGenerator.ts')} ${outputDir}/src/utils/`,
              `cp -r ${path.join(inputDir, '../src/utils/algorithmMain.ts')} ${outputDir}/src/utils/`,
              `cp -r ${path.join(inputDir, '../src/utils/reorderAlgorithm.ts')} ${outputDir}/src/utils/`,
            ];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
      },
    });

    // Create an API Gateway REST API
    const api = new apigateway.RestApi(this, 'AutoOrderAPI', {
      description: 'Auto Order API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });

    // Add the Lambda function as a backend for the API
    const lambdaIntegration = new apigateway.LambdaIntegration(autoOrderFunction);

    // Create the API endpoints
    const getProductionScenariosResource = api.root.addResource('GetProductionScenarios');
    getProductionScenariosResource.addMethod('GET', lambdaIntegration);

    const getOrdersResource = api.root.addResource('GetOrders');
    getOrdersResource.addMethod('POST', lambdaIntegration);

    const simulateOrdersResource = api.root.addResource('SimulateOrders');
    simulateOrdersResource.addMethod('GET', lambdaIntegration);

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the Auto Order API',
    });
  }
}
