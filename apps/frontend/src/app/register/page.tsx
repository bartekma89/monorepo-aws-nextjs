"use client";

import { useEffect, useState } from "react";
import { SignInOutput, SignUpOutput } from "aws-amplify/auth";
import type {} from "aws-amplify/auth";

import { RegisterForm, ConfirmationForm, AutoSignIn } from "@/components";
import { useRouter } from "next/navigation";

export type TSignUpState = SignUpOutput["nextStep"];
export type TSignInState = SignInOutput["nextStep"];

export default function RegisterPage() {
  const [step, setStep] = useState<TSignUpState | TSignInState | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!step) {
      return;
    }

    if ((step as TSignInState).signInStep === "DONE") {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (step) {
    switch ((step as TSignUpState).signUpStep) {
      case "CONFIRM_SIGN_UP":
        return <ConfirmationForm onStepChange={setStep} />;
      case "COMPLETE_AUTO_SIGN_IN":
        return <AutoSignIn onStepChange={setStep} />;
    }
  }

  return <RegisterForm onStepChange={setStep} />;
}
