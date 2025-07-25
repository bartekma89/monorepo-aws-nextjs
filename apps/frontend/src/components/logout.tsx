"use client";

import { useUser } from "@/app/hooks";

export function Logout() {
  const { logout, user, isLoading } = useUser();

  if (user === null) {
    return null;
  }

  return (
    <button
      className="btn bg-red-600 rounded-2xl text-white px-2 py-1 cursor-pointer"
      onClick={async () => {
        await logout();
      }}>
      {isLoading ? "..." : "Logout"}
    </button>
  );
}
