import type { Metadata } from "next";
import { SuccessClient } from "../components/SuccessClient";

export const metadata: Metadata = {
  title: "Payment received",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <SuccessClient orderId={typeof order === "string" ? order : null} />;
}
