#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TranslatorServiceStack } from "./stacks";

const app = new cdk.App();
new TranslatorServiceStack(app, "TranslatorServiceStack");
