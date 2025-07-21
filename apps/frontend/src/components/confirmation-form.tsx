"use client";

import { TConfirmationFormProps, TSignUpState } from "@/lib/types";
import { confirmSignUp } from "aws-amplify/auth";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface IConfirmationFormProps {
  onStepChange: (value: TSignUpState) => void;
}

export function ConfirmationForm({ onStepChange }: IConfirmationFormProps) {
  const [errorApi, setErrorApi] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TConfirmationFormProps>();

  const onSubmit: SubmitHandler<TConfirmationFormProps> = async (
    { email, confirmationCode },
    event
  ) => {
    event?.preventDefault();

    try {
      const data = await confirmSignUp({
        username: email,
        confirmationCode,
      });

      onStepChange(data.nextStep);
    } catch (error) {
      console.error("Error confirming sign up:", error);

      if (error instanceof Error) {
        setErrorApi(error.message);
      } else {
        setErrorApi(String(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          className="bg-white mb-2"
          {...register("email", { required: true })}
        />
        {errors.email && <span>field is required</span>}
      </div>
      <div className="flex flex-col">
        <label htmlFor="verificationCode">Verification Code</label>
        <input
          type="text"
          className="bg-white mb-2"
          {...register("confirmationCode", { required: true })}
        />
        {errors.confirmationCode && <span>field is required</span>}
      </div>
      <div>
        <button className="block btn bg-blue-200 p-2 mt-2 rounded-xl">
          Confirm
        </button>
      </div>
      {errorApi && <p className="text-red-500 font-bold">{errorApi}</p>}
    </form>
  );
}
