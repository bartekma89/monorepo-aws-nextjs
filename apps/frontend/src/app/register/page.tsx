"use client";

import { useEffect, useState } from "react";

import { RegisterForm, ConfirmationForm, AutoSignIn } from "@/components";
import { useRouter } from "next/navigation";
import { TSignInState, TSignUpState } from "@/lib/types";

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
