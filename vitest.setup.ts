import '@testing-library/jest-dom/vitest';

class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback([
      {
        contentRect: target.getBoundingClientRect(),
      } as ResizeObserverEntry,
    ], this as unknown as ResizeObserver);
  }
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  value: ResizeObserverMock,
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: !query.includes('max-width'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    addListener: () => {},
    removeEventListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect(): DOMRect {
  return {
    width: 720,
    height: 640,
    top: 0,
    left: 0,
    bottom: 640,
    right: 720,
    x: 0,
    y: 0,
    toJSON() {
      return {};
    },
  } as DOMRect;
};

Element.prototype.scrollTo = function scrollTo(optionsOrX?: ScrollToOptions | number, y?: number) {
  if (typeof optionsOrX === 'number') {
    this.scrollTop = y ?? 0;
  } else if (optionsOrX) {
    this.scrollTop = optionsOrX.top ?? 0;
  }
};

if (!('clipboard' in navigator)) {
  // @ts-expect-error clipboard polyfill
  navigator.clipboard = {
    writeText: async () => Promise.resolve(),
    readText: async () => Promise.resolve(''),
  };
}

