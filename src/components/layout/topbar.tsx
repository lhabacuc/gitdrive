"use client";

import { Search, ChevronLeft, ChevronRight, Menu, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const params = useParams();
  const owner = params.owner as string | undefined;
  const repo = params.repo as string | undefined;
  const pathSegments = params.path as string[] | undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && owner && repo) {
      router.push(`/drive/${owner}/${repo}?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  // Build path breadcrumbs for the headerbar
  const pathParts: { label: string; href: string }[] = [];
  if (owner && repo) {
    pathParts.push({ label: repo, href: `/drive/${owner}/${repo}` });
    if (pathSegments) {
      pathSegments.forEach((seg, i) => {
        pathParts.push({
          label: seg,
          href: `/drive/${owner}/${repo}/tree/${pathSegments.slice(0, i + 1).join("/")}`,
        });
      });
    }
  }

  return (
    <>
      <header className="flex h-[46px] items-center gap-1 border-b border-white/[0.08] bg-[hsl(var(--topbar))] px-1.5 sm:px-2 shrink-0">
        {/* Left: Hamburger (mobile) + Navigation */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.07] transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.07] transition-colors hidden sm:block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => router.forward()}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.07] transition-colors hidden sm:block"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Path bar or Search */}
        <div className="flex-1 flex justify-center px-1 sm:px-2 min-w-0">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="h-8 pl-9 pr-3 text-sm bg-[hsl(var(--view))] border-white/[0.08] rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
                  autoFocus
                  onBlur={() => {
                    if (!query) setSearchOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setQuery("");
                    }
                  }}
                />
              </div>
            </form>
          ) : (
            <div className="flex items-center bg-[hsl(var(--view))] rounded-lg border border-white/[0.08] h-8 px-1 max-w-md w-full min-w-0">
              {pathParts.length > 0 ? (
                <div className="flex items-center gap-0.5 overflow-hidden overflow-x-auto scrollbar-thin px-1 min-w-0">
                  {/* On mobile, show only the last 2 segments */}
                  {pathParts.map((part, i) => (
                    <div key={part.href} className={`flex items-center gap-0.5 shrink-0 ${
                      i < pathParts.length - 2 ? "hidden sm:flex" : "flex"
                    }`}>
                      {((i > 0 && i >= pathParts.length - 2) || (i > 0 && typeof window !== "undefined" && window.innerWidth >= 640)) && (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <button
                        onClick={() => router.push(part.href)}
                        className={`text-sm px-1.5 py-0.5 rounded transition-colors truncate max-w-[120px] sm:max-w-none ${
                          i === pathParts.length - 1
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {part.label}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground px-2">Files</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {
              if (owner && repo) setSearchOpen(!searchOpen);
            }}
            className={`rounded-lg p-2 transition-colors ${
              searchOpen
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-white/[0.07]"
            }`}
            disabled={!owner || !repo}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.07] transition-colors hidden sm:block">
            <LayoutGrid className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <VisuallyHidden.Root>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden.Root>
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
