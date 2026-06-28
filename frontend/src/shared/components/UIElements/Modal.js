/**
 * Modal — reusable dialog with header/content/footer, backdrop and animation.
 *
 * Split into two parts: ModalOverlay renders the actual dialog markup through a
 * React portal into #modal-hook (so it layers above the app), and Modal wraps it
 * with a Backdrop and a CSSTransition for a 200ms enter/leave animation. The body
 * is a <form> so consumers can pass onSubmit; otherwise submits are prevented.
 */
import React from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";

import Backdrop from "./Backdrop";
import "./Modal.css";

const ModalOverlay = (props) => {
  const content = (
    <div className={`modal ${props.className}`} style={props.style}>
      <header className={`modal__header ${props.headerClass}`}>
        <h2>{props.header}</h2>
      </header>
      {/* Use caller's onSubmit if provided; otherwise block the default
          full-page reload so an Enter keypress doesn't navigate away. */}
      <form
        onSubmit={
          props.onSubmit ? props.onSubmit : (event) => event.preventDefault()
        }
      >
        <div className={`modal__content ${props.contentClass}`}>
          {props.children}
        </div>
        <footer className={`modal__footer ${props.footerClass}`}>
          {props.footer}
        </footer>
      </form>
    </div>
  );
  // Portal into #modal-hook so the dialog escapes parent stacking/overflow contexts.
  return ReactDOM.createPortal(content, document.getElementById("modal-hook"));
};

const Modal = (props) => {
  return (
    <React.Fragment>
      {/* Backdrop sits behind the dialog; clicking it triggers onCancel to close. */}
      {props.show && <Backdrop onClick={props.onCancel} />}
      {/* CSSTransition animates mount/unmount over 200ms (must match the CSS).
          mountOnEnter/unmountOnExit keep the modal out of the DOM when hidden. */}
      <CSSTransition
        in={props.show}
        mountOnEnter
        unmountOnExit
        timeout={200}
        classNames="modal"
      >
        <ModalOverlay {...props} />
      </CSSTransition>
    </React.Fragment>
  );
};

export default Modal;
