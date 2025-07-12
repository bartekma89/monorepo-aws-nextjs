import Link from "next/link";

export const Navbar = async () => {
  return (
    <div className="flex gap-2 px-4 py-2 bg-orange-400">
      <Link href="/">Home</Link>
      <Link href="/user">User</Link>
    </div>
  );
};
