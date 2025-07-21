"use client";

import { useTranslation } from "@/app/hooks/useTranslation";
import { ITranslateRequest } from "@sff/shared-types";
import { SubmitHandler, useForm } from "react-hook-form";

export const TranslateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITranslateRequest>();

  const { isTranslating, translate } = useTranslation();

  const onSubmit: SubmitHandler<ITranslateRequest> = (data, event) => {
    event?.preventDefault();

    translate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col">
        <label htmlFor="sourceText">Input text</label>
        <textarea
          className="bg-white mb-2"
          id="sourceText"
          {...register("sourceText", { required: true })}
        />
        {errors.sourceText && <span>{errors.sourceText.message}</span>}
      </div>
      <div className="flex flex-col">
        <label htmlFor="sourceLang">Input Lang</label>
        <input
          className="bg-white mb-2"
          id="sourceLang"
          {...register("sourceLang", { required: true })}
        />
        {errors.sourceLang && <span>{errors.sourceLang.message}</span>}
      </div>
      <div className="flex flex-col">
        <label htmlFor="targetLang">Output Lang</label>
        <input
          className="bg-white mb-2"
          id="targetLang"
          {...register("targetLang", { required: true })}
        />
        {errors.targetLang && <span>{errors.targetLang.message}</span>}
      </div>
      <button className="btn bg-blue-200 p-2 mt-3 rounded-xl" type="submit">
        {isTranslating ? "translating..." : "translate"}
      </button>
    </form>
  );
};
