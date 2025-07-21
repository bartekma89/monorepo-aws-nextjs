"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

import { signUp } from "aws-amplify/auth";
import { TRegisterFormProps, TSignUpState } from "@/lib/types";

interface IRegisterFormProps {
  onStepChange: (value: TSignUpState) => void;
}

export function RegisterForm({ onStepChange }: IRegisterFormProps) {
  const [errorApi, setErrorApi] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TRegisterFormProps>();

  const onSubmit: SubmitHandler<TRegisterFormProps> = async (
    { email, password, password2 },
    event
  ) => {
    event?.preventDefault();

    try {
      if (password !== password2) {
        throw new Error("Passwords do not match");
      }

      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: true,
        },
      });

      onStepChange(nextStep);
    } catch (error: unknown) {
      console.error("Error signing up:", error);

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
        {errors.email && <span>{errors.email.message ?? "email missing"}</span>}
      </div>
      <div className="flex flex-col">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="bg-white mb-2"
          {...register("password", { required: true })}
        />
        {errors.password && (
          <span>{errors.password.message ?? "password missing"}</span>
        )}
      </div>
      <div className="flex flex-col">
        <label htmlFor="password2">ReType Password</label>
        <input
          type="password"
          className="bg-white mb-2"
          {...register("password2", { required: true })}
        />
        {errors.password2 && (
          <span>{errors.password2.message ?? "password missing"}</span>
        )}
      </div>
      <div>
        <button className="block btn bg-blue-200 p-2 mt-2 rounded-xl mb-2">
          Register
        </button>
        <Link href="/user">Login</Link>
      </div>
      {errorApi && <p className="text-red-500 font-bold">{errorApi}</p>}
    </form>
  );
}
