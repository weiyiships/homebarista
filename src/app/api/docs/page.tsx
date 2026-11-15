import type { Metadata } from "next";
import { ApiDocs } from "./ApiDocs";

export const metadata: Metadata = { title: "API reference · Homebarista" };

export default function ApiDocsPage() {
  return <ApiDocs />;
}
