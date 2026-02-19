import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Sparkles, Loader2, BookOpen, Quote } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { LibrarySearchBar } from './LibrarySearchBar';
import type { SearchResult } from '@/types/library';

interface LibraryDashboardProps {
  searchResult: SearchResult | null;
  isLoading: boolean;
  searchQuery: string;
  onSearch: (query: string) => void;
  bookPanel?: ReactNode;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightString(text: string, query: string): ReactNode {
  const normalized = query.trim();
  if (!normalized) {
    return text;
  }

  const expression = new RegExp(`(${escapeRegExp(normalized)})`, 'gi');
  const parts = text.split(expression);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <mark
          key={`${part}-${index}`}
          className="bg-amber-200/80 dark:bg-amber-500/40 text-inherit rounded px-0.5"
        >
          {part}
        </mark>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function highlightChildren(node: ReactNode, query: string): ReactNode {
  if (typeof node === 'string') {
    return highlightString(node, query);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <span key={index}>{highlightChildren(child, query)}</span>
    ));
  }

  return node;
}

const markdownComponents = (query: string): Components => ({
  h1: ({ children }) => (
    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-3 mb-2">
      {highlightChildren(children, query)}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-3 mb-2">
      {highlightChildren(children, query)}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-3 mb-2">
      {highlightChildren(children, query)}
    </h5>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-100 whitespace-pre-wrap">
      {highlightChildren(children, query)}
    </p>
  ),
  li: ({ children }) => (
    <li className="text-sm leading-relaxed text-slate-700 dark:text-slate-100 ml-5 list-disc">
      {highlightChildren(children, query)}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-teal-400 dark:border-teal-600 pl-4 italic text-slate-700 dark:text-slate-200 my-2">
      {highlightChildren(children, query)}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 overflow-x-auto my-2 text-xs">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-teal-700 dark:text-teal-300 underline decoration-teal-400/60"
    >
      {highlightChildren(children, query)}
    </a>
  ),
});

export function LibraryDashboard({
  searchResult,
  isLoading,
  searchQuery,
  onSearch,
  bookPanel,
}: LibraryDashboardProps) {
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  const ragResults = searchResult?.ragResults ?? [];
  const groupedByBook = ragResults.reduce<
    Array<{
      documentId: string;
      title: string;
      author: string;
      filePath?: string;
      items: typeof ragResults;
    }>
  >((acc, result) => {
    const existing = acc.find(
      (entry) => entry.documentId === result.documentId,
    );

    if (existing) {
      existing.items.push(result);
      if (!existing.filePath && result.documentFilePath) {
        existing.filePath = result.documentFilePath;
      }
      return acc;
    }

    acc.push({
      documentId: result.documentId,
      title: result.documentTitle,
      author: result.documentAuthor,
      filePath: result.documentFilePath,
      items: [result],
    });
    return acc;
  }, []);

  const hasBookPanel = !!bookPanel;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 lg:py-20 space-y-16 lg:space-y-24">
      <div className="relative text-center space-y-6 max-w-4xl mx-auto">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center justify-center p-5 rounded-[2rem] bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-600 dark:text-teal-400 mb-4 shadow-inner ring-1 ring-teal-200/50 dark:ring-teal-700/30">
          <BrainCircuit size={48} strokeWidth={1} />
        </div>

        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
          Asistente Clínico{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
            Inteligente
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed tracking-tight">
          Busca evidencia en los libros ya ingeridos para ubicar rapido la
          fuente y revisar el contenido original.
        </p>
      </div>

      <div className="space-y-10">
        <LibrarySearchBar onSearch={onSearch} />
      </div>

      <div className="space-y-12">
        {searchResult && (
          <div className="flex items-center gap-4 p-6 rounded-3xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 text-sky-800 dark:text-sky-300 shadow-sm transition-all hover:shadow-md">
            <div className="p-2 rounded-xl bg-white dark:bg-sky-900/40 shadow-sm text-sky-600">
              <Sparkles size={24} />
            </div>
            <span className="text-base font-bold tracking-tight">
              {ragResults.length === 0
                ? 'No encontramos pasajes relevantes para esta busqueda.'
                : `Encontramos ${ragResults.length} pasajes relevantes en ${groupedByBook.length} libros.`}
            </span>
          </div>
        )}

        <div
          className={
            hasBookPanel
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
              : 'space-y-6'
          }
        >
          <div className={hasBookPanel ? 'lg:col-span-7 space-y-6' : undefined}>
            {!searchResult && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-8 text-center">
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Escribe al menos 3 caracteres para buscar pasajes en tu
                  biblioteca.
                </p>
              </div>
            )}

            {groupedByBook.map((book) => (
              <article
                key={book.documentId}
                className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 space-y-5"
              >
                <header className="space-y-1">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                    <BookOpen size={18} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Libro fuente
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {book.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {book.author || 'Autor no especificado'}
                  </p>
                  {book.filePath && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 break-all">
                      {book.filePath}
                    </p>
                  )}
                </header>

                <div className="space-y-3">
                  {book.items.map((item) => {
                    const snippet = item.snippet || item.content;
                    const context =
                      item.context || item.fullContext || item.content;
                    const isExpanded = expandedResultId === item.id;
                    const hasDifferentContext =
                      context.trim() !== snippet.trim();

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Quote size={16} />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Pagina {item.pageNumber}
                            {item.sectionType ? ` - ${item.sectionType}` : ''}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Coincidencia
                          </p>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            components={markdownComponents(searchQuery)}
                          >
                            {snippet}
                          </ReactMarkdown>
                        </div>

                        {isExpanded && (
                          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Contexto ampliado
                            </p>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeSanitize]}
                              components={markdownComponents(searchQuery)}
                            >
                              {context}
                            </ReactMarkdown>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          {item.documentId ? (
                            <Link
                              to={`/biblioteca/libros/${item.documentId}?page=${item.pageNumber}&q=${encodeURIComponent(searchQuery)}`}
                              className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                            >
                              Abrir libro
                            </Link>
                          ) : null}

                          {hasDifferentContext && (
                            <button
                              type="button"
                              className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                              onClick={() =>
                                setExpandedResultId((prev) =>
                                  prev === item.id ? null : item.id,
                                )
                              }
                            >
                              {isExpanded ? 'Ocultar contexto' : 'Ver contexto'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}

            {isLoading && (
              <div className="mt-8 flex items-center justify-center p-10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/10 text-slate-400 transition-all">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-teal-500" />
                <span className="text-sm font-bold tracking-widest uppercase">
                  Buscando evidencia...
                </span>
              </div>
            )}
          </div>

          {hasBookPanel ? (
            <aside className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 overflow-hidden">
                <div className="max-h-[calc(100vh-12rem)] overflow-auto">
                  {bookPanel}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
