/**
 * Authentication middleware.
 *
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import createError from 'http-errors'

/**
 * Middleware to check if a user is authenticated.
 * Throws a 401 error if the user is not authenticated or if the session has expired.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
export async function checkAuthentication (req, res, next) {
  try {
    // Ensure session credentials exist
    if (!req.session.creds) {
      return next(createError(403))
    }
    const expires = req.session.creds.created_at + req.session.creds.expires_in

    if (expires - (Math.floor(Date.now() / 1000)) < 0) {
      return next(createError(401))
    }
  } catch (err) {
    if (err.status) {
      return next(err)
    }
    return next(createError(400, err.message))
  }
  next()
}
