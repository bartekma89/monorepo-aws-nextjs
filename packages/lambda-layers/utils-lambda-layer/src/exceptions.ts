export class MissingEnvVariableError extends Error {
  constructor(variableName: string) {
    super(`Environment variable ${variableName} is not set`);
  }
}

export class MissingBodyError extends Error {
  constructor() {
    super("Request body is missing");
  }
}

export class MissingParameters extends Error {
  constructor(fieldName: string) {
    super(`${fieldName} parameter is missing`);
  }
}
