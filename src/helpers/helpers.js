/**
 * Helpers
 *
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import axios from 'axios'
import createError from 'http-errors'

/**
 * Fetches recent activities.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Array} - An array of recent activities.
 */
export async function fetchRecentActivities (req, res, next) {
  const tokenType = req.session.creds.token_type
  const accessToken = req.session.creds.access_token
  const username = req.session.user.username
  const totalEvents = 101
  const perPage = 20
  let page = 1
  const allEvents = []

  try {
    let response // Declare the response variable outside the do-while loop
    do {
      response = await axios.get(`https://gitlab.lnu.se/api/v4/users/${username}/events`, {
        headers: {
          Authorization: `${tokenType} ${accessToken}`
        },
        params: {
          per_page: perPage,
          page
        }
      })
      allEvents.push(...response.data)
      page++
    } while (allEvents.length < totalEvents && response.data.length === perPage && page <= Math.ceil(totalEvents / perPage))

    // Trim the activities array to a maximum of 101
    const recentEvents = allEvents.slice(0, totalEvents)
    const formatedEvents = recentEvents.map(event => {
      return {
        actionName: event.action_name,
        createdAt: new Date(event.created_at).toLocaleString(),
        targetTitle: event.target_title || event.push_data?.commit_title,
        targetType: event.target_type || event.push_data?.ref_type
      }
    })
    return formatedEvents
  } catch (error) {
    next(createError(500, error.message || 'Internal Server Error'))
  }
}
