import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
} from "../constructs";

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = "../";
    const lambdasDirPath = path.join(projectRoot, "packages/lambdas");
    const lambdaLayersDirPath = path.join(
      projectRoot,
      "packages/lambda-layers"
    );

    const translateService = new RestApiService(this, "translateService");

    new TranslationService(this, "translationService", {
      lambdasDirPath,
      lambdaLayersDirPath,
      restApi: translateService,
    });

    new StaticWebsiteDeployment(this, "staticWebsiteDeploymentService", {
      projectRoot,
    });
  }
}
