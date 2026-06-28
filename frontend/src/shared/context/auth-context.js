/**
 * auth-context.js — the auth Context contract
 *
 * Defines the SHAPE and default values of the auth context only — it is the
 * "interface" components rely on when calling useContext(AuthContext). The
 * real state and behavior live in auth-hook.js; the defaults here are just
 * placeholders used before/outside a Provider.
 */
import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  login: () => {},
  logout: () => {},
});
