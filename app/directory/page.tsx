import { redirect } from "next/navigation";

export default function DirectoryPage() {
  // Redirect `/directory` to the canonical home page `/`
  redirect("/");
}
