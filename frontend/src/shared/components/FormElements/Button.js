/**
 * Button — polymorphic, consistently-styled clickable element.
 *
 * Renders one of three elements based on props so callers get the right semantics
 * for free: an external link (<a>) when `href` is set, an in-app react-router
 * <Link> when `to` is set, or a plain <button> otherwise. All three share the same
 * CSS class string, with optional size/inverse/danger style modifiers.
 */
import { Link } from "react-router-dom";

import "./Button.css";

const Button = (props) => {
  // `href` => external navigation, so render a real anchor tag.
  if (props.href) {
    return (
      <a
        className={`button button--${props.size || "default"} ${
          props.inverse && "button--inverse"
        } ${props.danger && "button--danger"}`}
        href={props.href}
      >
        {props.children}
      </a>
    );
  }
  // `to` => client-side route change, so use react-router's <Link> (no full reload).
  if (props.to) {
    return (
      <Link
        to={props.to}
        exact={props.exact}
        className={`button button--${props.size || "default"} ${
          props.inverse && "button--inverse"
        } ${props.danger && "button--danger"}`}
      >
        {props.children}
      </Link>
    );
  }
  // Default case: a true <button> that supports onClick, type and disabled.
  return (
    <button
      className={`button button--${props.size || "default"} ${
        props.inverse && "button--inverse"
      } ${props.danger && "button--danger"}`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default Button;
