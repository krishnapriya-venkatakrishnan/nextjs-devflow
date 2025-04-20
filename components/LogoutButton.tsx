// components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

const LogoutButton = () => {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <Button
      onClick={handleLogout}
      className="base-medium w-fit !bg-transparent px-4 py-3"
    >
      <LogOut className="size-5 text-black dark:text-white" />
      <span className="text-dark300_light900 max-lg:hidden">Logout</span>
    </Button>
  );
};

export default LogoutButton;
