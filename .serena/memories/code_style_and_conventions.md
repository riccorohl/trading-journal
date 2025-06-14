# Code Style and Conventions

## TypeScript

- The project uses TypeScript for type safety, but with some relaxed settings:
  - `noImplicitAny`: false
  - `noUnusedParameters`: false
  - `noUnusedLocals`: false
  - `strictNullChecks`: false
  - These settings allow for more flexibility but may reduce type safety

- Type definitions are stored in the `src/types` directory
- The project uses TypeScript path aliases with `@/*` mapping to `./src/*`

## Component Structure

- React functional components with TypeScript interfaces for props
- Components are organized in the `src/components` directory
- UI components from shadcn/ui are in `src/components/ui`
- Page components are in `src/pages` directory

## State Management

- React Context API is used for global state management
- Context providers are in the `src/contexts` directory
- Local component state is managed with React's `useState` and `useEffect` hooks

## Styling

- Tailwind CSS is used for styling
- Custom theme configuration in `tailwind.config.ts`
- CSS variables for theming (light/dark mode support)
- Class naming follows Tailwind's utility-first approach

## File Naming

- PascalCase for component files (e.g., `Dashboard.tsx`, `AddTrade.tsx`)
- camelCase for utility files and hooks
- Component files export a default component with the same name as the file

## Imports

- Import order is not strictly enforced
- Path aliases are used for imports from the src directory (`@/components`, `@/hooks`, etc.)

## Form Handling

- React Hook Form is used for form management
- Zod is used for form validation
- Form schemas are defined within the component files

## Error Handling

- Toast notifications for user feedback
- Try/catch blocks for error handling where appropriate

## Comments and Documentation

- Comments are used sparingly
- Code is written to be self-documenting where possible
- TypeScript interfaces serve as documentation for data structures

## Testing

- No formal testing framework is currently set up

## Linting

- ESLint is configured in `eslint.config.js`
- Some rules are relaxed, such as `@typescript-eslint/no-unused-vars` being turned off
- React hooks rules are enforced