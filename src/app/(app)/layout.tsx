import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ClipboardProvider } from "@/hooks/use-clipboard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClipboardProvider>
      <div className="flex h-screen h-screen-safe overflow-hidden bg-[hsl(var(--view))]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Topbar />
          <main className="flex-1 overflow-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </ClipboardProvider>
  );
}
