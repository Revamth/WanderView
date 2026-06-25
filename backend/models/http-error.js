/**
 * HttpError — custom Error subclass that carries an HTTP status code.
 *
 * Lets controllers/middleware throw or `next()` a single object that bundles a
 * human-readable message with the status code to return. The error-handling
 * middleware in app.js reads `error.code` to set the response status.
 */
class HttpError extends Error {
  constructor(message, errorCode) {
    // Pass the message up to the native Error so .message/.stack work as usual.
    super(message);
    // Attach the HTTP status code (e.g. 404, 422, 500) onto the error itself.
    this.code = errorCode;
  }
}

module.exports = HttpError;
