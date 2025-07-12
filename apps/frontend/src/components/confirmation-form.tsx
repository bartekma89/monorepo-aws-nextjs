"use client";

import { TSignUpState } from "@/app/register/page";
import { confirmSignUp } from "aws-amplify/auth";
import { useState } from "react";

interface IConfirmationFormProps {
  onStepChange: (value: TSignUpState) => void;
}

export function ConfirmationForm({ onStepChange }: IConfirmationFormProps) {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        try {
          const data = await confirmSignUp({
            username: email,
            confirmationCode: verificationCode,
          });

          console.log("Confirmation successful:", data);

          onStepChange(data.nextStep);
        } catch (error) {
          console.error("Error confirming sign up:", error);
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
        <label htmlFor="verificationCode">Verification Code</label>
        <input
          type="text"
          className="bg-white mb-2"
          name="verificationCode"
          id="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
      </div>
      <div>
        <button className="block btn bg-blue-200 p-2 mt-2 rounded-xl">
          Confirm
        </button>
      </div>
    </form>
  );
}
