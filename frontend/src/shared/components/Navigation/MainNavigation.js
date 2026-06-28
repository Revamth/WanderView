/**
 * MainNavigation — the app's top navigation bar, responsive across breakpoints.
 *
 * On desktop it shows the title and NavLinks inside the MainHeader. On mobile the
 * hamburger button toggles a slide-in SideDrawer containing the same NavLinks.
 * A Backdrop is rendered behind the drawer so tapping outside closes it. Drawer
 * open/closed state lives here and is shared with both the drawer and the backdrop.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";

import MainHeader from "./MainHeader";
import NavLinks from "./NavLinks";
import SideDrawer from "./SideDrawer";
import Backdrop from "../UIElements/Backdrop";
import "./MainNavigation.css";

const MainNavigation = (props) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  const openDrawerHandler = () => {
    setDrawerIsOpen(true);
  };

  const closeDrawerHandler = () => {
    setDrawerIsOpen(false);
  };

  return (
    <React.Fragment>
      {/* Dimmed overlay shown only while the mobile drawer is open; click closes it. */}
      {drawerIsOpen && <Backdrop onClick={closeDrawerHandler} />}
      {/* Mobile slide-in menu. onItemClick closes the drawer after a link is tapped. */}
      <SideDrawer show={drawerIsOpen}>
        <nav className="main-navigation__drawer-nav">
          <NavLinks onItemClick={closeDrawerHandler} />
        </nav>
      </SideDrawer>

      <MainHeader>
        {/* Hamburger button — the three spans are styled into bars via CSS. */}
        <button
          className="main-navigation__menu-btn"
          onClick={openDrawerHandler}
        >
          <span />
          <span />
          <span />
        </button>
        <h1 className="main-navigation__title">
          <Link to="/">WanderView</Link>
        </h1>
        {/* Desktop nav links, hidden on small screens via CSS in favour of the drawer. */}
        <nav className="main-navigation__header-nav">
          <NavLinks />
        </nav>
      </MainHeader>
    </React.Fragment>
  );
};

export default MainNavigation;
