import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Start the worker unconditionally
worker.start({
    onUnhandledRequest: 'bypass', // Optional: Decide what to do with unhandled requests (e.g., bypass, warn)
  });


