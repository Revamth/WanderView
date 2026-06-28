/**
 * MainHeader — semantic <header> wrapper for the top navigation bar.
 *
 * A thin presentational layout component: it just provides the styled <header>
 * element and renders whatever children (title, hamburger, nav) MainNavigation
 * passes in.
 */
import "./MainHeader.css";

const MainHeader = (props) => {
  return <header className="main-header">{props.children}</header>;
};

export default MainHeader;
