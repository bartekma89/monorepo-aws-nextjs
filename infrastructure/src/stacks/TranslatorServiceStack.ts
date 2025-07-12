import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
  UserAuthService,
} from "../constructs";

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userAuthService = new UserAuthService(this, "userAuthService");

    const translateService = new RestApiService(this, "translateService");

    new TranslationService(this, "translationService", {
      restApi: translateService,
    });

    new StaticWebsiteDeployment(this, "staticWebsiteDeploymentService");
  }
}
