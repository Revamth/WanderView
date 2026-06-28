/**
 * Card — small presentational container with the app's card styling.
 *
 * A reusable surface (shadow/rounded background) that wraps arbitrary children.
 * Callers can extend it with an extra className and inline style.
 */
import "./Card.css";

const Card = (props) => {
  return (
    <div className={`card ${props.className}`} style={props.style}>
      {props.children}
    </div>
  );
};

export default Card;
