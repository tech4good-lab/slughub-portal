import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PendingApprovals from "./pending-approvals";

export default async function AdminReviewPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (!session) redirect("/login");
  if (role !== "admin") redirect("/forbidden");

  const email = (session as any)?.user?.email ?? "";

  return <PendingApprovals email={email} />;
}