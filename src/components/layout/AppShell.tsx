import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black/15">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1 overflow-hidden">
          <Topbar />
          <main className="mx-auto w-full max-w-[1680px] px-4 py-5 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
