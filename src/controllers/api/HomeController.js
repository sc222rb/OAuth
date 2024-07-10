/**
 * @file Defines the HomeController class.
 * @module HomeController
 * @author Sayaka Chishiki Jakobsson
 */

import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class HomeController {
  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   * index GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {void}
   */
  index (req, res, next) {
    try {
      const viewData = {
        user: req.session.user
      }
      return res.render('home/index', { viewData })
    } catch (err) {
      next(createError(500, err.message))
    }
  }
}
