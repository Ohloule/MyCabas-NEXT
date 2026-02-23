"use client";

import { Toaster } from "react-hot-toast";

export function VendorToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "0.625rem",
          fontSize: "0.875rem",
          fontFamily: "Nunito, Helvetica, sans-serif",
          maxWidth: "360px",
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
        success: {
          style: {
            background: "var(--principale-50)",
            color: "var(--principale-900)",
            border: "1px solid var(--principale-200)",
          },
          iconTheme: {
            primary: "var(--principale-600)",
            secondary: "var(--principale-50)",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          },
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fef2f2",
          },
        },
      }}
    />
  );
}
