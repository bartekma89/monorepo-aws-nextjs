"use client";

import { useEffect } from "react";
import { autoSignIn } from "aws-amplify/auth";
import { TSignInState } from "@/app/register/page";

interface IAutoSignInProps {
  onStepChange: (value: TSignInState) => void;
}

export function AutoSignIn({ onStepChange }: IAutoSignInProps) {
  useEffect(() => {
    const asyncSignIn = async () => {
      const { nextStep } = await autoSignIn();

      console.log(nextStep);

      onStepChange(nextStep);
    };
    asyncSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>signing in.....</div>;
}
