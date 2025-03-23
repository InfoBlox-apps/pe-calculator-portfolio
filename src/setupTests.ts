
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the matchMedia function which is not available in the test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })),
});

// Mock IntersectionObserver which is not available in the test environment
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver which is not available in the test environment
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock document.createRange which is used by some DOM testing libraries
if (typeof document.createRange !== 'function') {
  document.createRange = () => {
    const range = {
      setStart: vi.fn(),
      setEnd: vi.fn(),
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      } as unknown as Node,
      getClientRects: () => [
        {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          height: 0,
          width: 0,
          x: 0,
          y: 0,
          toJSON: vi.fn(),
        } as DOMRect,
      ],
    } as unknown as Range;
    return range;
  };
}

// This handles async component updates
vi.setTimeout(10000);
