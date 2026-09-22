import { redirect } from "next/navigation";

export default function DeprecatedLeaderEditPage() {
  redirect("/leader/dashboard");
}
