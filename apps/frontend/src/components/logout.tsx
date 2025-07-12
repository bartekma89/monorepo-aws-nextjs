"use client";

import { signOut } from "aws-amplify/auth";

interface ILogoutProps {
  onSignOut: () => void;
}

export function Logout({ onSignOut }: ILogoutProps) {
  return (
    <button
      className="btn bg-red-600"
      onClick={async () => {
        await signOut();
        onSignOut();
      }}>
      Logout
    </button>
  );
}
