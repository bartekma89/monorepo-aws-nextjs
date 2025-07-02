#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TranslatorServiceStack } from "./stacks";

const app = new cdk.App();
new TranslatorServiceStack(app, "TranslatorServiceStack");
console.log(__dirname);
console.log(__filename);
console.log(process.cwd());
