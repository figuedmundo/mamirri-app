## UI component best practices

- **Single Responsibility**: Each component should have one clear purpose and do it well
- **Reusability**: Design components to be reused across different contexts with configurable props
- **Composability**: Build complex UIs by combining smaller, simpler components rather than monolithic structures
- **Clear Interface**: Define explicit, well-documented props with sensible defaults for ease of use
- **Encapsulation**: Keep internal implementation details private and expose only necessary APIs
- **Consistent Naming**: Use clear, descriptive names that indicate the component's purpose and follow team conventions
- **State Management**: Keep state as local as possible; lift it up only when needed by multiple components
- **Minimal Props**: Keep the number of props manageable; if a component needs many props, consider composition or splitting it
- **Data Fetching**: Use TanStack Query hooks for all API interactions. NEVER use `useEffect` for data fetching.
- **Performance Optimization**:
  - **Code Splitting**: Use `React.lazy()` and `Suspense` for routes and heavy components (e.g., Charts, PDF generators).
  - **Interaction States**: Use `useTransition` for non-urgent UI updates like list filtering or search to maintain input responsiveness.
  - **Caching**: Leverage TanStack Query's `staleTime` and `gcTime` for automatic background refetching and caching.
- **Documentation**: Document component usage, props, and provide examples for easier adoption by team members
