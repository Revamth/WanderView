import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import { AuthContext } from "../../context/auth-context";
import "./NavLinks.css";

const NavLinks = (props) => {
  const auth = useContext(AuthContext);

  const handleItemClick = () => {
    if (props.onItemClick) {
      props.onItemClick();
    }
  };

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
