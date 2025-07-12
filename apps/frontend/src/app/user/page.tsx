"use client";

import { LoginForm, Logout } from "@/components";
import { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

export default function UserPage() {
  const [user, setUser] = useState<object | null | undefined>(undefined);

  const setCurrentUser = useCallback(async () => {
    try {
      const currUser = await getCurrentUser();

      console.log(currUser);

      setUser(currUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user === undefined) {
    return <div>loading...</div>;
  }

  if (user) {
    return <Logout onSignOut={() => setUser(null)} />;
  }

  return <LoginForm onSignIn={setCurrentUser} />;
}
