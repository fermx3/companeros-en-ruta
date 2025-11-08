/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// This file contains TypeScript type declarations for Jest and Testing Library
// It is not a test file and should not be executed as one

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toBeDisabled(): R;
    }
  }
}

export {}
