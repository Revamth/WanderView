/**
 * NavLinks — the actual list of navigation links, shared by header and drawer.
 *
 * Which links appear depends on auth state read from AuthContext: logged-in users
 * see "My Places", "Add Place" and "Logout"; logged-out users see "Authenticate".
 * The optional onItemClick prop lets the parent (e.g. the mobile drawer) close
 * itself whenever a link is followed.
 */
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import { AuthContext } from "../../context/auth-context";
import "./NavLinks.css";

const NavLinks = (props) => {
  // Global auth state drives which links are rendered below.
  const auth = useContext(AuthContext);

  // Notify the parent that a link was clicked (used to close the mobile drawer).
  const handleItemClick = () => {
    if (props.onItemClick) {
      props.onItemClick();
    }
  };

  // Log out, then also fire onItemClick so the drawer closes after logging out.
  const handleLogout = () => {
    auth.logout();
    if (props.onItemClick) {
      props.onItemClick();
    }
  };

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact onClick={handleItemClick}>
          ALL USERS
        </NavLink>
      </li>
      {/* Auth-only links: "My Places" is scoped to the current user's id. */}
      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.userId}/places`} onClick={handleItemClick}>
            MY PLACES
          </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new" onClick={handleItemClick}>
            ADD PLACE
          </NavLink>
        </li>
      )}
      {/* Shown only to guests — the entry point to log in / sign up. */}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth" onClick={handleItemClick}>
            AUTHENTICATE
          </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <button onClick={handleLogout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
