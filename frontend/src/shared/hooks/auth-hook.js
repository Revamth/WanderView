/**
 * auth-hook.js — the actual auth state and logic
 *
 * Custom hook backing AuthContext. Owns token/userId state, persists the
 * session to localStorage so it survives page refreshes, auto-logs-in on
 * mount if a non-expired session exists, and schedules an automatic logout
 * when the token expires. App.js consumes this and feeds it into the Provider.
 */
import { useState, useCallback, useEffect } from "react";

// Module-scoped timer handle so the auto-logout setTimeout can be cleared
// from any effect run without living in component state.
let logoutTimer;
export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExpirationState, setTokenExpirationState] = useState();
  const [userId, setUserId] = useState(false);

  // login() sets in-memory auth state AND persists {userId, token, expiration}
  // to localStorage so a refresh can restore the session (see mount effect below).
  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    // Use the caller-provided expiration (e.g. restoring from storage) or
    // default to one hour from now for a fresh login.
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationState(tokenExpirationDate);
    // NOTE: localStorage is readable by any JS on the page, so it is
    // XSS-vulnerable. An httpOnly cookie would be safer (not script-readable)
    // but cannot be accessed from JS; this is a deliberate, well-known tradeoff.
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
      })
    );
  }, []);

  // logout() clears both in-memory state and the persisted session.
  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationState(null);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  // Auto-logout: whenever we have a valid token, schedule logout to fire after
  // exactly the token's remaining lifetime. If the token is cleared, cancel any
  // pending timer so we don't log out an already-logged-out user.
  useEffect(() => {
    if (token && tokenExpirationState) {
      const remainingTime =
        tokenExpirationState.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationState]);

  // Runs once on mount: rehydrate the session from localStorage so a page
  // refresh keeps the user logged in — but only if a stored token exists and
  // has not yet expired. Calling login() also re-arms the auto-logout timer.
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  return { token, login, logout, userId };
};
