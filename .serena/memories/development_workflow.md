# Development Workflow

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Access the application at http://localhost:8080

## Development Process

### Feature Development

1. **Understand the requirement**: Make sure you understand what needs to be built
2. **Plan your approach**: Determine which files need to be created or modified
3. **Implement the feature**: Write the code following the project's style and conventions
4. **Test locally**: Verify that the feature works as expected
5. **Refine and polish**: Improve the code and user experience
6. **Commit changes**: Use clear commit messages

### Bug Fixing

1. **Reproduce the issue**: Understand the steps to reproduce the bug
2. **Identify the cause**: Debug to find the root cause
3. **Fix the issue**: Make the necessary code changes
4. **Verify the fix**: Test to ensure the bug is resolved
5. **Check for regressions**: Ensure the fix doesn't break other functionality
6. **Commit the fix**: Use a clear commit message describing the bug and solution

## Working with Components

### Creating a New Component

1. Create a new file in the appropriate directory (e.g., `src/components`)
2. Define the component's props interface
3. Implement the component using React functional components
4. Export the component as default
5. Import and use the component where needed

### Modifying Existing Components

1. Understand the component's current functionality
2. Make the necessary changes
3. Test to ensure the component still works as expected
4. Update any related components if needed

## State Management

### Using Context

1. Import the context hook (e.g., `useTradeContext`)
2. Use the context functions and data in your component
3. Update state using the provided functions

### Local State

1. Use React's `useState` hook for component-specific state
2. Use `useEffect` for side effects and lifecycle management

## Styling

1. Use Tailwind CSS utility classes for styling
2. Follow the existing design patterns
3. Use shadcn/ui components when appropriate
4. Ensure responsive design works on different screen sizes

## Building and Deployment

1. Build the project with `npm run build`
2. Test the production build with `npm run preview`
3. Deploy using Lovable's publishing feature

## Best Practices

1. Keep components small and focused
2. Use TypeScript types for better code quality
3. Follow the existing code style and conventions
4. Test thoroughly before committing changes
5. Use meaningful variable and function names
6. Document complex logic with comments