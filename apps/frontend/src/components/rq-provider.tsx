"use client";

import { ReactNode, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

interface IProviderProps {
  children: ReactNode;
}

export const Provider = ({ children }: IProviderProps) => {
  const [client] = useState(() => new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
