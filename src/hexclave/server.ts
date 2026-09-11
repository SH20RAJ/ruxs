import { HexclaveServerApp } from "@hexclave/next";
import { hexclaveClientApp } from "./client";

export const hexclaveServerApp = new HexclaveServerApp({
  inheritsFrom: hexclaveClientApp,
  secretServerKey:
    process.env.HEXCLAVE_SECRET_SERVER_KEY || "dummy_secret_key_placeholder",
  projectId:
    process.env.HEXCLAVE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_HEXCLAVE_PROJECT_ID ||
    "afdff151-7a3c-49b3-830f-abfcc23d8d61",
});
