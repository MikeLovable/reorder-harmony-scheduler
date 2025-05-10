
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

/**
 * Props for the AutoOrderStack
 */
export interface LovableStackProps extends cdk.StackProps {
  /**
   * Optional custom domain for the CloudFront distribution
   */
  customDomain?: string;
  
  /**
   * Optional S3 bucket to use as the origin for the CloudFront distribution
   */
  originBucket?: s3.IBucket;
  
  /**
   * Required S3 key fragment to be the origin for the CloudFront distribution
   */
  originBasePath: string;
}

export class AutoOrderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: LovableStackProps) {
    super(scope, id, props);

    // Define the Lambda function that will handle API requests
    const autoOrderFunction = new nodejs.NodejsFunction(this, 'AutoOrderFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/index.ts'),
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

    // Create an API Gateway REST API with CORS enabled for all origins
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

    // Get or create the S3 bucket to host the web application
    let websiteBucket: s3.Bucket;
    if (props?.originBucket) {
      websiteBucket = props.originBucket as s3.Bucket;
    } else {
      // Create a new S3 bucket for hosting the web application
      websiteBucket = new s3.Bucket(this, 'LovableInventoryApp', {
        bucketName: 'lovable-inventory-app-' + this.account + '-' + this.region,
        publicReadAccess: false,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // For development; use RETAIN for production
        autoDeleteObjects: true, // For development; remove for production
      });
    }

    // Set up CloudFront distribution
    let certificate: acm.ICertificate | undefined;
    let domainNames: string[] | undefined;
    
    // If a custom domain was provided, create ACM certificate
    if (props?.customDomain) {
      certificate = new acm.Certificate(this, 'LovableCertificate', {
        domainName: props.customDomain,
        validation: acm.CertificateValidation.fromDns(),
      });
      
      domainNames = [props.customDomain];
    }

    // Create CloudFront Origin Access Identity (OAI)
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'Access to the website bucket',
    });
    
    // Grant the OAI read access to the bucket
    websiteBucket.grantRead(originAccessIdentity);

    // Define CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'LovableDistribution', {
      defaultRootObject: 'index.html',
      domainNames,
      certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originPath: props?.originBasePath ? `/${props.originBasePath}` : undefined,
          originAccessIdentity,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html', // SPA fallback
        },
      ],
    });

    // Create DNS entry if custom domain is provided
    if (props?.customDomain) {
      // Look up the hosted zone for the domain
      const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: props.customDomain.split('.').slice(-2).join('.'), // Get the root domain
      });
      
      // Create DNS record
      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        recordName: props.customDomain,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
      });
    }
    
    // Build and deploy React app to S3
    // First, get the project root directory
    const projectDir = path.join(__dirname, '../../');
    
    // Create a deployment to S3
    new s3deploy.BucketDeployment(this, 'DeployWebApp', {
      sources: [
        s3deploy.Source.asset(path.join(projectDir), {
          bundling: {
            image: cdk.DockerImage.fromRegistry('node:18'),
            command: [
              'bash', '-c', [
                'npm install',
                'npm run build',
                'cp -r /asset-input/dist/* /asset-output/'
              ].join(' && ')
            ],
            user: 'root'
          }
        })
      ],
      destinationBucket: websiteBucket,
      destinationKeyPrefix: props?.originBasePath || 'app',
      distribution,
      distributionPaths: ['/*'],
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the Auto Order API',
    });

    // Output the CloudFront Distribution URL
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'URL of the CloudFront Distribution',
    });

    // If custom domain is provided, output that URL too
    if (props?.customDomain) {
      new cdk.CfnOutput(this, 'CustomDomainUrl', {
        value: `https://${props.customDomain}`,
        description: 'URL of the custom domain',
      });
    }
  }
}
