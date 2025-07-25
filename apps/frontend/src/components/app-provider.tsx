"use client";

import { TAuthUser } from "@/lib/types";
import { createContext, PropsWithChildren, useContext, useState } from "react";

type TAuthUserState = TAuthUser | null | undefined;

interface IAppContextProps {
  user: TAuthUserState;
  setUser: (user: TAuthUserState) => void;
}

const AppContext = createContext<IAppContextProps>({
  user: null,
  setUser: () => {},
});

const useInitialValue = () => {
  const [user, setUser] = useState<TAuthUserState>(null);

  return {
    user,
    setUser,
  };
};

export const AppProvider = ({ children }: PropsWithChildren) => {
  const value = useInitialValue();

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useApp must be used within a AppProvider");
  }

  return context;
};
