export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand font-semibold">Flex Living</span>
            <span className="text-muted">Dashboard</span>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}