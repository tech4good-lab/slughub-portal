"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { clearPortalTransition } from "@/lib/slugTransition";

export default function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // If the user is on any page other than the portal ("/") and the about page ("/about"),
    // clear the portal transition flag so navigating to about from other pages won't trigger exit animation.
    if (pathname !== "/" && pathname !== "/about") {
      clearPortalTransition();
    }
  }, [pathname]);

  return null;
}
