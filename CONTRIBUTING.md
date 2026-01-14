# Contributing to Mamirri App

First off, thank you for considering contributing to Mamirri App! Your help is invaluable in building this ecosystem.

This document provides guidelines for contributing to the project. Please read it carefully to ensure a smooth and effective collaboration.

## 🚀 Getting Started

1.  **Install Dependencies:** This is a monorepo using npm workspaces. Install all dependencies from the root directory:
    ```bash
    pnpm install
    ```

2.  **Run Services:** Start the required services (like PostgreSQL and Redis) using Docker Compose:
    ```bash
    docker compose up -d
    ```

3.  **Run Applications:**
    *   **client and server:** `pnpm dev`

## 🌿 Branching Model

We follow a simplified Gitflow model:

*   `main`: Contains production-ready code. Direct pushes are forbidden.
*   `develop`: The main development branch. All feature branches are merged into `develop`.
*   **Feature Branches:** All new features and bug fixes should be developed in their own branches, created from `develop`.

### Branch Naming Conventions

Please use the following prefixes for your branch names to provide context:

*   `feature/`: For new features (e.g., `feature/user-profile`).
*   `fix/`: For bug fixes (e.g., `fix/login-error-42`).
*   `docs/`: For documentation changes (e.g., `docs/update-readme`).
*   `style/`: For code style changes (e.g., `style/format-auth-module`).
*   `refactor/`: For code refactoring without changing functionality.
*   `test/`: For adding or improving tests.

**Example:**
```bash
git checkout -b feat/add-points-redemption
```

##  COMMIT Message Guidelines

We adhere to the **Conventional Commits** specification. This creates a clean, readable, and machine-parsable Git history.

### Format

Each commit message should have the following format:
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

*   **Type:** Must be one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`.
*   **Scope (optional):** The part of the codebase the commit affects (e.g., `api`, `web`, `auth`, `db`).
*   **Subject:** A concise description of the change in the imperative mood (e.g., "add", "fix", "change" not "added", "fixed", "changed").

### Examples

*   `feat(api): add endpoint for user profile`
*   `fix(web): correct alignment of login button`
*   `docs(contributing): add guidelines for AI collaboration`
*   `refactor(auth): simplify token generation logic`


All new features must be accompanied by corresponding tests. We aim for high test coverage to ensure code quality and stability.

## 🤖 AI Collaboration Guidelines

We encourage the use of AI assistants (like GitHub Copilot, Gemini, etc.) to accelerate development. However, the following rules apply:

1.  **You Are the Author:** You are responsible for all code you commit, regardless of whether it was written by you or an AI.
2.  **Review and Understand:** Never commit AI-generated code that you do not fully understand.
3.  **Testing is Mandatory:** AI-generated code must be held to the same standard as human-written code. It must be fully tested and pass all CI checks.
4.  **Provide the "Why":** AI is good at describing *what* changed, but poor at explaining *why*. It is your responsibility to provide this crucial context in commit message bodies and pull request descriptions.

## Pull Requests (PRs)

1.  Create your feature branch from `develop`.
2.  Once your work is complete and tested, push your branch to the remote repository.
3.  Open a Pull Request against the `develop` branch.
4.  Fill out the PR template, providing a clear description of the changes and linking any relevant issues.
5.  Assign a reviewer. Once approved, the PR can be merged.
