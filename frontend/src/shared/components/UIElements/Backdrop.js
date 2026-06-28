/**
 * Backdrop — semi-transparent full-screen overlay shown behind modals/drawers.
 *
 * Rendered via a React portal into #backdrop-hook so it covers the whole viewport
 * regardless of where it's used. Clicking it fires onClick, which callers wire to
 * their close/cancel handler to dismiss the overlaying UI.
 */
import ReactDOM from "react-dom";

import "./Backdrop.css";

const Backdrop = (props) => {
  // Portal into #backdrop-hook so the overlay covers the entire page.
  return ReactDOM.createPortal(
    <div className="backdrop" onClick={props.onClick}></div>,
    document.getElementById("backdrop-hook")
  );
};

export default Backdrop;
