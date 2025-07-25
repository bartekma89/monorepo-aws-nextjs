"use client";

import { useEffect } from "react";
import { TSignInState } from "@/lib/types";
import { useUser } from "@/app/hooks";

interface IAutoSignInProps {
  onStepChange: (value: TSignInState) => void;
}

export function AutoSignIn({ onStepChange }: IAutoSignInProps) {
  const { autoSignInUser } = useUser();

  useEffect(() => {
    autoSignInUser().then((nextStep) => {
      if (nextStep) {
        onStepChange(nextStep);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>signing in.....</div>;
}
