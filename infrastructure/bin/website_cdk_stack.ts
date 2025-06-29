#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { WebsiteCdkStack } from "../lib/website_cdk_stack";

const app = new cdk.App();
new WebsiteCdkStack(app, "WebsiteCdkStack", {});
