# Default Agent Instructions

- You have useful tools available as MCP or command-line. Use them.
- Unless you are absolutely sure that you have correct and, crucially, up-to-date information in your knowledge, always get information from the web. You can use Tavily for searching and getting information, and you can always use curl to fetch web pages.
- When working in a git repository, always switch to a new branch, unless explicitly insutrcted not to.
- If the project has tests you can run locally, always run them and make sure everything works correctly.

## Source Control (Git)
- when invoking `git commit`, always use `--author="AI <figuedmundo+ai@gmail.com>"`

## Useful Command-Line Tools

### JSON
- Use the `jq` command to read and extract information from JSON files.

### RipGrep
- The `rg` (ripgrep) command is available for fast searches in text files.

### Clipboard
- Pipe content into `pbcopy` to copy it into the clipboard. Example: `echo "hello" | pbcopy`.
- Pipe from `pbpaste` to get the contents of the clipboard. Example: `pbpaste > fromclipboard.txt`.

### Web (HTTP/S)
- Use `curl` to fetch web pages.

## MCP Tools

### markitdown
- Use this to convert various file formats to markdown.
- Very useful if you need to read files that are not supported natively by the model.

### tavily
- Use this to run web searches. It is always better to search the web than to rely on your own knowledge, which may be outdated.
- You can also retrieve content in a format easy for ingestion. Use that if needed, but you can also just use curl if you have a URL.

### Context7
- Use the Context7 MCP tool to read the documentation for many libraries and tools.
- If you're asked to use a library, framework, or tool, it often makes sense to review its documentation first with Context7.

## JavaScript / TypeScript
- Unless instructed otherwise, always use `deno` to run .js or .ts scripts.
- Use `npx` for running commands directly from npm packages.

## Documentation Sources
- If working with a new library or tool, consider looking for its documentation from its website, GitHub project, or the relevant llms.txt.
  - It is always better to have accurate, up-to-date documentation at your disposal, rather than relying on your pre-trained knowledge.
- You can search the following directories for llms.txt collections for many projects:
  - https://llmstxt.site/
  - https://directory.llmstxt.cloud/
- If you find a relevant llms.txt file, follow the links until you have access to the complete documentation.

<skills>

## Skills

You have new skills. If any skill might be relevant then you MUST read it.

- [docs-write](.skills/docs-write/SKILL.md) - Write documentation following Metabase's conversational, clear, and user-focused style. Use when creating or editing documentation files (markdown, MDX, etc.).
- [frontend-design](.skills/frontend-design/SKILL.md) - Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
- [modern-javascript-patterns](.skills/modern-javascript-patterns/SKILL.md) - Master ES6+ features including async/await, destructuring, spread operators, arrow functions, promises, modules, iterators, generators, and functional programming patterns for writing clean, efficient JavaScript code. Use when refactoring legacy code, implementing modern patterns, or optimizing JavaScript applications.
- [systematic-debugging](.skills/systematic-debugging/SKILL.md) - Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes - four-phase framework (root cause investigation, pattern analysis, hypothesis testing, implementation) that ensures understanding before attempting solutions
- [test-writer](.skills/test-writer/SKILL.md) - Generate comprehensive Vitest tests for code examples in JavaScript concept documentation pages, following project conventions and referencing source lines
</skills>