/**
 * Avatar — small presentational circular profile image.
 *
 * Renders an <img> in a styled container. Size is driven by the `width` prop
 * (applied to both width and height to keep it square), with optional className
 * and inline style overrides from the caller.
 */
import "./Avatar.css";

const Avatar = (props) => {
  return (
    <div className={`avatar ${props.className}`} style={props.style}>
      <img
        src={props.image}
        alt={props.alt}
        style={{ width: props.width, height: props.width }}
      />
    </div>
  );
};

export default Avatar;
