export interface ITranslateRequest {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
}

export interface ITranslateResponse {
  timestamp: string;
  targetText: string;
}

type ITranslatePrimaryKey = {
  username: string;
  requestId: string;
};

export type ITranslateResult = ITranslateRequest &
  ITranslateResponse &
  ITranslatePrimaryKey;

export type TTranslateResultList = ITranslateResult[];
