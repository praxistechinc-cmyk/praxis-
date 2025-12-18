"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
        active ? "bg-black text-white" : "text-gray-700 hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}

export default function ProjectNav({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <NavLink href={`/projects/${projectId}/overview`} label="Overview" />
      <NavLink href={`/projects/${projectId}/practice`} label="Practice" />
      <NavLink href={`/projects/${projectId}/rep`} label="Rep" />
      <NavLink href={`/projects/${projectId}/manager`} label="Manager" />
    </div>
  );
}
