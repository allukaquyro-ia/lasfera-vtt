import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="px-4 py-5 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
