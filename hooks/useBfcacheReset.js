import { useEffect } from 'react';

/**
 * Custom hook to reset loading/submitting/redirecting state when a page is shown
 * (e.g. back/forward cache navigation or returning from external domains like Shopify checkout).
 *
 * @param {Function | Array<Function>} resetFnOrFns - Single state reset function or array of functions (e.g. () => setIsRedirecting(false))
 */
export function useBfcacheReset(resetFnOrFns) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePageShow = (event) => {
      // Execute state reset on every pageshow event to handle both persisted bfcache
      // and cross-origin back navigation from external checkout URLs.
      if (Array.isArray(resetFnOrFns)) {
        resetFnOrFns.forEach((fn) => {
          if (typeof fn === 'function') fn();
        });
      } else if (typeof resetFnOrFns === 'function') {
        resetFnOrFns();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [resetFnOrFns]);
}

export default useBfcacheReset;
