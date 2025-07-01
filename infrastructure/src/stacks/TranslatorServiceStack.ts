import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

import { TranslationService } from "../constructs";

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = "../";
    const lambdasDirPath = path.join(projectRoot, "packages/lambdas");
    const lambdaLayersDirPath = path.join(
      projectRoot,
      "packages/lambda-layers"
    );

    new TranslationService(this, "TranslationService", {
      lambdasDirPath,
      lambdaLayersDirPath,
    });

    // s3 bucket for website hosting
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // cloudfront oac - origin access control
    const oac = new cloudfront.CfnOriginAccessControl(this, "WebsiteOAC", {
      originAccessControlConfig: {
        name: "WebsiteOACConfig",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
        description: "OAC for website bucket",
      },
    });

    // cloudfront distribution
    const cfnDistribution = new cloudfront.CfnDistribution(
      this,
      "WebsiteBucketDistribution",
      {
        distributionConfig: {
          enabled: true,
          comment: "Website bucket distribution",
          defaultRootObject: "index.html",
          origins: [
            {
              id: "WebsiteBucketOrigin",
              domainName: websiteBucket.bucketRegionalDomainName,
              originAccessControlId: oac.attrId,
              s3OriginConfig: {},
            },
          ],
          defaultCacheBehavior: {
            targetOriginId: "WebsiteBucketOrigin",
            viewerProtocolPolicy:
              cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            compress: true,
            allowedMethods: ["GET", "HEAD", "OPTIONS"],
            cachedMethods: ["GET", "HEAD"],
            forwardedValues: {
              queryString: false,
              cookies: {
                forward: "none",
              },
            },
          },
          customErrorResponses: [
            {
              errorCode: 404,
              responsePagePath: "/404.html",
              responseCode: 404,
            },
            {
              errorCode: 403,
              responsePagePath: "/404.html",
              responseCode: 403,
            },
          ],
        },
      }
    );

    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [websiteBucket.arnForObjects("*")],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${
              cdk.Stack.of(this).account
            }:distribution/${cfnDistribution.ref}`,
          },
        },
      })
    );

    new s3deploy.BucketDeployment(this, "WebsiteDeployment", {
      sources: [
        s3deploy.Source.asset(path.join(projectRoot, "apps/frontend/dist")),
      ],
      destinationBucket: websiteBucket,
    });

    new cdk.CfnOutput(this, "websiteUrl", {
      exportName: "websiteUrl",
      value: `https://${cfnDistribution.attrDomainName}`,
    });
  }
}
