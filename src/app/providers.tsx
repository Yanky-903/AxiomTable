"use client";

import { Provider } from "react-redux";
import { store } from "../store";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient();

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
