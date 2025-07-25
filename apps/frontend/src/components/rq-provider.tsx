"use client";

import { ReactNode, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AppProvider } from "@/components";

interface IProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: IProviderProps) => {
  const [client] = useState(() => new QueryClient());

  return (
    <AppProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    </AppProvider>
  );
};
