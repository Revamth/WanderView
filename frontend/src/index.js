/**
 * index.js — application entry point
 *
 * Bootstraps the React app by mounting the root <App /> component into the
 * DOM node with id "root" (defined in public/index.html). This is the very
 * first file the bundler runs; everything else flows from <App />.
 */
import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";

// Legacy React 16/17 mounting API (ReactDOM.render) — NOT the React 18
// createRoot()/root.render() API. This style still works but opts out of
// React 18 concurrent features. Migrating would mean using ReactDOM.createRoot.
ReactDOM.render(<App />, document.getElementById("root"));
