"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardDrive, Star, Clock, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "./user-profile";
import { AppLogoMinimal } from "@/components/ui/app-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { label: "Recent", href: "/recent", icon: Clock },
  { label: "Starred", href: "/starred", icon: Star },
  { label: "My Drive", href: "/drive", icon: HardDrive },
  { label: "Trash", href: "/trash", icon: Trash2 },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Headerbar spacer — same height as topbar to align */}
      <div className="h-[46px] flex items-center gap-2.5 px-4 border-b border-foreground/[0.08]">
        <AppLogoMinimal className="h-5 w-5" />
        <span className="text-sm font-semibold text-foreground">GitDrive</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {navItems.map((item, i) => {
          const isActive =
            item.label === "My Drive"
              ? pathname.startsWith(item.href)
              : pathname === item.href;
          return (
            <Link
              key={`${item.label}-${i}`}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 md:py-[7px] text-[13px] transition-colors",
                isActive
                  ? "bg-foreground/[0.08] text-foreground font-medium"
                  : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings + User Profile at bottom */}
      <div className="border-t border-foreground/[0.08] p-2 space-y-0.5 safe-bottom">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 md:py-[7px] text-[13px] transition-colors",
            pathname.startsWith("/settings")
              ? "bg-foreground/[0.08] text-foreground font-medium"
              : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
        <ThemeToggle />
        <UserProfile />
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex h-full w-56 flex-col bg-[hsl(var(--sidebar))] border-r border-foreground/[0.08]">
      <SidebarContent />
    </aside>
  );
}
