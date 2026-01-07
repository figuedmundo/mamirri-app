import React from 'react';

export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex h-screen w-full">
      <aside className="w-64 bg-muted border-r">Sidebar placeholder</aside>
      <main className="flex-1">
        <header className="h-16 border-b">Header placeholder</header>
        <div className="flex-1 p-4">{children}</div>
      </main>
    </div>
  );
};
