import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

interface IUserAuthServiceProps extends cdk.StackProps {}

export class UserAuthService extends Construct {
  userPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props?: IUserAuthServiceProps) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, "translationUserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      "translationUserPoolClient",
      {
        userPool: this.userPool,
        userPoolClientName: "translator-web-client",
        generateSecret: false,
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
      }
    );

    new cdk.CfnOutput(this, "userPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "userPoolClient", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
