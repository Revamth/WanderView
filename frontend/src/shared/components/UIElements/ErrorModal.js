/**
 * ErrorModal — thin convenience wrapper around Modal for showing error messages.
 *
 * Preconfigures a standard "An Error Occurred!" dialog with an Okay button. It is
 * visible whenever an `error` string is present (show={!!props.error}) and calls
 * onClear to dismiss, so callers just pass their error state and a clear handler.
 */
import Modal from "./Modal";
import Button from "../FormElements/Button";

const ErrorModal = (props) => {
  return (
    <Modal
      onCancel={props.onClear}
      header="An Error Occurred!"
      show={!!props.error}
      footer={<Button onClick={props.onClear}>Okay</Button>}
    >
      <p>{props.error}</p>
    </Modal>
  );
};

export default ErrorModal;
