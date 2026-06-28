/**
 * http-hook.js — central HTTP client hook
 *
 * useHttpClient wraps fetch with shared loading/error state and request
 * cancellation. Every component that talks to the backend uses this so the
 * networking logic (errors, aborting in-flight requests on unmount) lives in
 * one place instead of being duplicated everywhere.
 */
import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // Holds an AbortController for every in-flight request. useRef (not useState)
  // is used because mutating this list must NOT trigger a re-render — it's a
  // mutable instance variable that persists across renders.
  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      // One AbortController per request; track it so the cleanup effect below
      // can cancel this request if the component unmounts mid-flight.
      const httpAbortControl = new AbortController();
      activeHttpRequests.current.push(httpAbortControl);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          // Passing the controller's signal lets us abort() this fetch later.
          signal: httpAbortControl.signal,
        });

        const responseData = await response.json();

        // Request finished, so drop its controller from the active list.
        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortControl
        );

        // fetch only rejects on network failure, not on HTTP 4xx/5xx — so we
        // explicitly throw on non-OK responses to route them into catch below.
        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        // Re-throw so the calling component can also react (e.g. skip navigation).
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  // Cleanup on unmount: abort every still-pending request. This prevents the
  // "Can't perform a React state update on an unmounted component" warning that
  // happens when a response resolves after its component is already gone.
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
