import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { useBookMarkdownQuery } from '@/hooks/use-library';

interface PageSection {
  pageNumber: number;
  content: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightString(text: string, query: string): ReactNode {
  if (!query.trim()) {
    return text;
  }

  const expression = new RegExp(`(${escapeRegExp(query.trim())})`, 'gi');
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

function parseMarkdownByPage(markdown: string): PageSection[] {
  const markerRegex = /<!--\s*PAGE_NUMBER:\s*(\d+)\s*-->/gi;
  const matches = Array.from(markdown.matchAll(markerRegex));

  if (matches.length === 0) {
    return [{ pageNumber: 1, content: markdown }];
  }

  const sections: PageSection[] = [];
  let cursor = 0;
  let currentPage = 1;

  for (const match of matches) {
    const markerIndex = match.index ?? 0;
    const content = markdown.slice(cursor, markerIndex).trim();

    if (content.length > 0) {
      sections.push({ pageNumber: currentPage, content });
    }

    currentPage = Number(match[1]);
    cursor = markerIndex + match[0].length;
  }

  const rest = markdown.slice(cursor).trim();
  if (rest.length > 0) {
    sections.push({ pageNumber: currentPage, content: rest });
  }

  return sections.length > 0
    ? sections
    : [{ pageNumber: 1, content: markdown }];
}

const markdownComponents = (query: string): Components => ({
  h1: ({ children }) => (
    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-6 mb-3">
      {highlightChildren(children, query)}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-6 mb-3">
      {highlightChildren(children, query)}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-5 mb-2">
      {highlightChildren(children, query)}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[15px] leading-7 text-slate-700 dark:text-slate-200 mb-3">
      {highlightChildren(children, query)}
    </p>
  ),
  li: ({ children }) => (
    <li className="text-[15px] leading-7 text-slate-700 dark:text-slate-200 ml-5 list-disc">
      {highlightChildren(children, query)}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-teal-400 dark:border-teal-600 pl-4 italic text-slate-700 dark:text-slate-200 my-4">
      {highlightChildren(children, query)}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 overflow-x-auto my-4 text-xs">
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

export default function BibliotecaBook() {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const targetPage = Number(searchParams.get('page') ?? '1');

  const { data, isLoading, isError } = useBookMarkdownQuery(documentId);

  const sections = useMemo(
    () => parseMarkdownByPage(data?.content ?? ''),
    [data?.content],
  );

  useEffect(() => {
    if (!data || Number.isNaN(targetPage)) {
      return;
    }

    const anchor = document.getElementById(`page-${targetPage}`);
    if (
      anchor &&
      typeof (anchor as HTMLElement).scrollIntoView === 'function'
    ) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data, targetPage]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        <span>Cargando libro...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-4">
        <Link
          to="/biblioteca"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:underline"
        >
          <ArrowLeft size={16} />
          Volver a Biblioteca
        </Link>
        <p className="text-slate-700 dark:text-slate-200">
          No pudimos cargar el contenido del libro.
        </p>
      </div>
    );
  }

  const seenPages = new Set<number>();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 lg:py-12 space-y-8">
      <header className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-6">
        <Link
          to="/biblioteca"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:underline"
        >
          <ArrowLeft size={16} />
          Volver a Biblioteca
        </Link>

        <div className="flex items-start gap-3">
          <BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-400 mt-1" />
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {data.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {data.author || 'Autor no especificado'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 break-all">
              {data.filePath}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1 font-semibold">
            Pagina citada: {Number.isNaN(targetPage) ? '-' : targetPage}
          </span>
          {query.trim() ? (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 font-semibold">
              Busqueda: {query}
            </span>
          ) : null}
        </div>
      </header>

      <main className="space-y-6">
        {sections.map((section, index) => {
          const anchorId = !seenPages.has(section.pageNumber)
            ? `page-${section.pageNumber}`
            : undefined;
          seenPages.add(section.pageNumber);

          return (
            <section
              key={`${section.pageNumber}-${index}`}
              id={anchorId}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-5 lg:p-6"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <BookOpen size={12} />
                Pagina {section.pageNumber}
              </div>

              <div className="space-y-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={markdownComponents(query)}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
