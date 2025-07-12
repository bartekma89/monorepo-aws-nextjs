"use client";

import { useState } from "react";
import Link from "next/link";

import { TSignUpState } from "@/app/register/page";
import { signUp } from "aws-amplify/auth";

interface IRegisterFormProps {
  onStepChange: (value: TSignUpState) => void;
}

export function RegisterForm({ onStepChange }: IRegisterFormProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        if (password !== password2) {
          throw new Error("Passwords do not match");
        }

        try {
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

          console.log(nextStep);

          onStepChange(nextStep);
        } catch (error) {
          console.log("Error signing up:", error);
        }
      }}>
      <div className="flex flex-col">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          className="bg-white mb-2"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="bg-white mb-2"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="password2">ReType Password</label>
        <input
          type="password"
          className="bg-white mb-2"
          name="password2"
          id="password2"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
      </div>
      <div>
        <button className="block btn bg-blue-200 p-2 mt-2 rounded-xl">
          Sign up
        </button>
        <Link href="/user">Login</Link>
      </div>
    </form>
  );
}
