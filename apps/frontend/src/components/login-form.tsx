"use client";

import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { TLoginFormProps } from "@/lib/types";
import { useUser } from "@/app/hooks";

export function LoginForm() {
  const { errorApi, isLoading, login, user } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginFormProps>();

  const onSubmit: SubmitHandler<TLoginFormProps> = async (
    { email, password },
    event
  ) => {
    event?.preventDefault();

    await login({ email, password });
  };

  if (user === undefined) {
    return <div>loading...</div>;
  }

  if (user) {
    return <pre>{JSON.stringify(user, null, 2)}</pre>;
  }

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
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="bg-white mb-2"
          {...register("password", { required: true })}
        />
        {errors.password && <span>field is required</span>}
      </div>
      <div>
        <button className="block btn bg-blue-200 p-2 mt-2 rounded-xl mb-2">
          {isLoading ? "..." : "Login"}
        </button>
        <Link href="/register">Register</Link>
      </div>
      {errorApi && <p className="text-red-500 font-bold">{errorApi}</p>}
    </form>
  );
}
