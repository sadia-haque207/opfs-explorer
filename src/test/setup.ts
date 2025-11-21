import "@testing-library/jest-dom";
import { vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// Mock Chrome API
const mockChrome = {
  devtools: {
    inspectedWindow: {
      tabId: 123,
    },
  },
  tabs: {
    sendMessage: vi.fn(),
  },
  runtime: {
    lastError: undefined,
    onMessage: {
      addListener: vi.fn(),
    },
  },
} satisfies DeepPartial<typeof chrome>;

vi.stubGlobal("chrome", mockChrome);
