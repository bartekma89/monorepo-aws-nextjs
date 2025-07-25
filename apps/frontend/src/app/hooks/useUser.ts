"use client";

import { useCallback, useEffect, useState } from "react";
import { autoSignIn, confirmSignUp, getCurrentUser } from "aws-amplify/auth";
import { useApp } from "@/components/app-provider";

import { signIn, signUp, signOut } from "aws-amplify/auth";
import {
  TConfirmationFormProps,
  TLoginFormProps,
  TRegisterFormProps,
  TSignInState,
  TSignUpState,
} from "@/lib/types";

export function useUser() {
  const { user, setUser } = useApp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorApi, setErrorApi] = useState<string | null>();

  const getUser = useCallback(async () => {
    try {
      const currUser = await getCurrentUser();
      setUser(currUser);
    } catch {
      setUser(null);
    }
  }, [setUser]);

  const login = useCallback(async ({ email, password }: TLoginFormProps) => {
    try {
      setIsLoading(true);
      setErrorApi(null);
      await signIn({
        username: email,
        password,
        options: {
          clientMetadata: {
            email,
          },
        },
      });

      await getUser();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorApi(error.message);
      } else {
        setErrorApi(String(error));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerUser = useCallback(
    async ({
      email,
      password,
      password2,
    }: TRegisterFormProps): Promise<TSignUpState | null> => {
      let result = null;
      try {
        setIsLoading(true);
        setErrorApi(null);

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

        result = nextStep;
      } catch (error: unknown) {
        console.error("Error signing up:", error);

        if (error instanceof Error) {
          setErrorApi(error.message);
        } else {
          setErrorApi(String(error));
        }
      } finally {
        setIsLoading(false);
        return result;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      setIsLoading(true);
      setErrorApi(null);
      await signOut();
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        setErrorApi(error.message);
      } else {
        setErrorApi(String(error));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmUser = useCallback(
    async ({
      confirmationCode,
      email,
    }: TConfirmationFormProps): Promise<TSignUpState | null> => {
      let result = null;
      try {
        setIsLoading(true);
        setErrorApi(null);

        const { nextStep } = await confirmSignUp({
          username: email,
          confirmationCode,
        });

        result = nextStep;
      } catch (error) {
        console.error("Error confirming sign up:", error);

        if (error instanceof Error) {
          setErrorApi(error.message);
        } else {
          setErrorApi(String(error));
        }
      } finally {
        setIsLoading(false);
        return result;
      }
    },
    []
  );

  const autoSignInUser = useCallback(async (): Promise<TSignInState | null> => {
    let result = null;
    try {
      setIsLoading(true);
      setErrorApi(null);

      const { nextStep } = await autoSignIn();
      result = nextStep;
    } catch (error) {
      console.error("Error confirming sign up:", error);

      if (error instanceof Error) {
        setErrorApi(error.message);
      } else {
        setErrorApi(String(error));
      }
    } finally {
      setIsLoading(false);
      return result;
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      await getUser();
      setIsLoading(false);
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    isLoading,
    login,
    errorApi,
    getUser,
    setUser,
    registerUser,
    logout,
    confirmUser,
    autoSignInUser,
  };
}
