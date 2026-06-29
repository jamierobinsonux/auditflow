export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
      {children}
    </main>
  );
}
