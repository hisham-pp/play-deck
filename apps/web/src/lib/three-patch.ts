'use client';

// Filter internal third-party library deprecation warnings from Three.js v0.186+
if (typeof window !== 'undefined') {
  const origWarn = console.warn;
  console.warn = function (...args: unknown[]) {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('THREE.Clock') ||
        args[0].includes('PCFSoftShadowMap') ||
        args[0].includes('deprecated parameters for the initialization function'))
    ) {
      return;
    }
    origWarn.apply(console, args);
  };
}
