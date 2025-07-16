export interface ITranslateRequest {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
}

export interface ITranslateResponse {
  timestamp: string;
  targetText: string;
}

export type ITranslateDbObject = ITranslateRequest &
  ITranslateResponse & {
    username: string;
    requestId: string;
  };
