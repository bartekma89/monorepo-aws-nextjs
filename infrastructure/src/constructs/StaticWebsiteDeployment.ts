import path from "path";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cdk from "aws-cdk-lib";

interface IStaticWebsiteDeploymentProps extends cdk.StackProps {
  projectRoot: string;
}

export class StaticWebsiteDeployment extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { projectRoot }: IStaticWebsiteDeploymentProps
  ) {
    super(scope, id);

    // s3 bucket for website hosting
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // create an origin access identity (OAI)
    const oai = new cloudfront.OriginAccessIdentity(this, "WebsiteOAI");

    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [websiteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "WebsiteDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: websiteBucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                compress: true,
                allowedMethods:
                  cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              },
            ],
          },
        ],
        errorConfigurations: [
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
        defaultRootObject: "index.html",
        comment: "Website bucket distribution",
      }
    );

    new s3deploy.BucketDeployment(this, "WebsiteDeployment", {
      sources: [
        s3deploy.Source.asset(path.join(projectRoot, "apps/frontend/dist")),
      ],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "websiteUrl", {
      exportName: "websiteUrl",
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
