import type { ReactElement } from 'react';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full">
      <aside className="w-64 bg-muted border-r">Sidebar placeholder</aside>
      <main className="flex-1">
        <header className="h-16 border-b">Header placeholder</header>
        <div className="flex-1 p-4"></div>
      </main>
    </div>
  );
};
