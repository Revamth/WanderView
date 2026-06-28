/**
 * App.js — root component, routing and auth wiring
 *
 * Defines the app shell: it pulls auth state from useAuth, exposes it to the
 * whole tree via AuthContext.Provider, and decides which set of routes exist
 * based on whether the user has a token. Lazy-loaded pages are rendered inside
 * a Suspense boundary so the initial bundle stays small.
 */
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

import MainNavigation from "./shared/components/Navigation/MainNavigation";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";

// React.lazy + dynamic import() = code splitting: each page becomes its own
// bundle chunk that is fetched on demand instead of being shipped up front.
// The Suspense fallback below covers the loading gap while a chunk downloads.
const Users = React.lazy(() => import("./user/pages/Users"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"));
const UpdatePlace = React.lazy(() => import("./places/pages/UpdatePlace"));
const Auth = React.lazy(() => import("./user/pages/Auth"));

const App = () => {
  // useAuth is the custom hook that owns all auth state/logic (see auth-hook.js).
  const { token, login, logout, userId } = useAuth();

  let routes;

  // Routes are defined CONDITIONALLY on the presence of a token. This is the
  // route-guarding mechanism: protected routes (e.g. /places/new) simply do
  // not exist when logged out, so an unauthenticated user cannot reach them —
  // any unmatched path falls through to the <Redirect> at the end.
  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        {/* Logged-in users hitting an unknown URL go back to the home page. */}
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        {/* Logged-out users hitting any protected/unknown URL are forced to login. */}
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    // AuthContext.Provider wraps the entire tree so any descendant component
    // can read auth state via useContext(AuthContext) without prop drilling.
    // isLoggedIn is derived from token (!!token coerces it to a boolean).
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>
          {/* Suspense shows this spinner while a lazy route chunk is loading. */}
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
