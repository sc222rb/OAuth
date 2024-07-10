/**
 * Module for the AccountController.
 *
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
   * Redirects to index.
   *
   * @param {object} req  Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next function
   * @returns {void}
   */
  async redirect (req, res, next) {
    try {
      const viewData = {
        user: req.session.user
      }
      return res.render('home/index', { viewData })
    } catch (err) {
      next(createError(500, err.message))
    }
  }

  /**
   * Logs out the user by destroying the session and browser cookie.
   * Redirects to the index page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async logout (req, res, next) {
    try {
      // Clear the session
      req.session.destroy((error) => {
        if (error) {
          console.error('Error destroying session:', error.message || error)
          next(createError(500, error.message || 'Internal Server Error'))
        }
        res.clearCookie(process.env.SESSION_NAME)
        return res.redirect('../')
      })
    } catch (error) {
      console.error('Error during logout:', error.message || error)
      next(createError(500, error.message || 'Internal Server Error'))
    }
  }
}
