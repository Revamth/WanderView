/**
 * LoadingSpinner — small presentational loading indicator.
 *
 * Renders a CSS-animated dual-ring spinner. When `asOverlay` is true it adds an
 * overlay class so it covers and centers over its container (e.g. during async
 * requests) rather than sitting inline.
 */
import "./LoadingSpinner.css";

const LoadingSpinner = (props) => {
  return (
    // `asOverlay` toggles the full-cover centered overlay variant.
    <div className={`${props.asOverlay && "loading-spinner__overlay"}`}>
      <div className="lds-dual-ring"></div>
    </div>
  );
};

export default LoadingSpinner;
