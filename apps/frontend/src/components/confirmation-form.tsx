"use client";

import { useUser } from "@/app/hooks";
import { TConfirmationFormProps, TSignUpState } from "@/lib/types";
import { SubmitHandler, useForm } from "react-hook-form";

interface IConfirmationFormProps {
  onStepChange: (value: TSignUpState) => void;
}

export function ConfirmationForm({ onStepChange }: IConfirmationFormProps) {
  const { confirmUser, errorApi } = useUser();
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

    const nextStep = await confirmUser({ confirmationCode, email });

    if (nextStep) {
      onStepChange(nextStep);
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
