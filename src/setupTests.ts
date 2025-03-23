
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';

// Mock the matchMedia function which is not available in the test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(() => false),
  })),
});

// Mock IntersectionObserver which is not available in the test environment
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver which is not available in the test environment
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
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
      setStart: jest.fn(),
      setEnd: jest.fn(),
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
          toJSON: jest.fn(),
        } as DOMRect,
      ],
    } as unknown as Range;
    return range;
  };
}

// This handles async component updates
jest.setTimeout(10000);
