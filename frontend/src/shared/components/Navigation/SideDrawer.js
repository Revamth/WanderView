/**
 * SideDrawer — the mobile slide-in navigation panel.
 *
 * Rendered through a React portal into the #drawer-hook DOM node (defined in
 * index.html) so it sits above the rest of the app and escapes any parent
 * stacking/overflow context. Visibility is controlled by the `show` prop.
 */
import ReactDOM from "react-dom";
import "./SideDrawer.css";

const SideDrawer = (props) => {
  const content = props.show ? (
    <aside className={`side-drawer ${props.show ? "open" : ""}`}>
      {props.children}
    </aside>
  ) : null;

  // Portal out of the normal tree into #drawer-hook for correct overlay layering.
  return ReactDOM.createPortal(content, document.getElementById("drawer-hook"));
};

export default SideDrawer;
