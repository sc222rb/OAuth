/**
 * Module for the UserController.
 *
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import { fetchRecentActivities, fetchGroupsWithProjects } from '../../helpers/helpers.js'

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Shows the profile page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showProfile (req, res, next) {
    try {
      const viewData = {
        user: req.session.user
      }
      res.render('pages/profile', { viewData })
    } catch (err) {
      next(err)
    }
  }

  /**
   * Shows the activities page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showActivities (req, res, next) {
    try {
      const viewData = {}
      viewData.user = req.session.user
      viewData.activities = await fetchRecentActivities(req, res, next)
      res.render('pages/activities', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Shows the group projects page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async showGroupProjects (req, res, next) {
    try {
      const viewData = {}
      viewData.user = req.session.user
      const { groups, pageInfo } = await fetchGroupsWithProjects(req, res, next)
      viewData.groups = groups
      viewData.pageInfo = pageInfo
      res.render('pages/group-projects', { viewData })
    } catch (error) {
      next(error)
    }
  }
}
