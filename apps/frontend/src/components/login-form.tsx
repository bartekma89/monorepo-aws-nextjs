"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "aws-amplify/auth";

interface ILoginFormProps {
  onSignIn: () => void;
}

export function LoginForm({ onSignIn }: ILoginFormProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        await signIn({
          username: email,
          password,
          options: {
            clientMetadata: {
              email,
            },
          },
        });

        onSignIn();
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
      <div>
        <button className="block btn bg-blue-200 p-2 mt-2 rounded-xl">
          Login
        </button>
        <Link href="/register">Register</Link>
      </div>
    </form>
  );
}
