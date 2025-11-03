"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const links = [
  { href: "/(app)/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/(app)/trip/create", label: "Create trip", icon: "➕" }
];

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 flex-none flex-col gap-3 lg:flex">
      <TooltipProvider>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Tooltip key={link.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                {link.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
