import ReactDOM from "react-dom";
import "./SideDrawer.css";

const SideDrawer = (props) => {
  const content = props.show ? (
    <aside className={`side-drawer ${props.show ? "open" : ""}`}>
      {props.children}
    </aside>
  ) : null;

  return ReactDOM.createPortal(content, document.getElementById("drawer-hook"));
};

export default SideDrawer;
