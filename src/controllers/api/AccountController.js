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
      console.log('in redirect')
    } catch (err) {
      next(createError(500, err.message))
    }
  }
}
