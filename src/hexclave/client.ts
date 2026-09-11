import { HexclaveClientApp } from "@hexclave/next";

export const hexclaveClientApp = new HexclaveClientApp({
  tokenStore: "nextjs-cookie",
  projectId:
    process.env.NEXT_PUBLIC_HEXCLAVE_PROJECT_ID ||
    process.env.HEXCLAVE_PROJECT_ID ||
    "afdff151-7a3c-49b3-830f-abfcc23d8d61",
  urls: {
    default: {
      type: "hosted",
    },
    signIn: "/login",
    afterSignIn: "/customer/dashboard",
    afterSignOut: "/login",
  },
});
