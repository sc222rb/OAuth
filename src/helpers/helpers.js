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

/**
 * Fetches Groups with Projects.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {Function} next - The next function.
 * @returns {Promise<object>} - The response data.
 */
export async function fetchGroupsWithProjects (req, res, next) {
  const tokenType = req.session.creds.token_type
  const accessToken = req.session.creds.access_token
  const username = req.session.user.username
  const query = `{
    user(username: "${username}") {
    groups(first: 3) {
      nodes {
        id
        name
        webUrl
        avatarUrl
        fullPath
        projects(first: 5, includeSubgroups: true) {
          nodes {
            id
            name
            webUrl
            avatarUrl
            fullPath
            repository {
              tree {
                lastCommit {
                  id
                  committedDate
                  author {
                    name
                    avatarUrl
                    username
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
    }
  }`
  try {
    const response = await axios.post(
      'https://gitlab.lnu.se/api/graphql',
      {
        query
      },
      {
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    )
    const groups = response.data.data.user.groups.nodes.map(group => ({
      id: group.id,
      name: group.name,
      webUrl: group.webUrl,
      avatarUrl: group.avatarUrl,
      fullPath: group.fullPath,
      projects: group.projects.nodes.slice(0, 5).map(project => ({
        id: project.id,
        name: project.name,
        webUrl: project.webUrl,
        avatarUrl: project.avatarUrl,
        fullPath: project.fullPath,
        lastCommit: (project.repository?.tree?.lastCommit)
          ? {
              id: project.repository.tree.lastCommit.id,
              committedDate: new Date(project.repository.tree.lastCommit.committedDate).toLocaleString(),
              author: {
                name: project.repository.tree.lastCommit.author.name,
                username: project.repository.tree.lastCommit.author.username,
                avatarUrl: project.repository.tree.lastCommit.author.avatarUrl
              }
            }
          : null
      })),
      projectsPageInfo: group.projects.pageInfo
    }))

    const groupsPageInfo = response.data.data.user.groups.pageInfo // Correctly accessing the groups pageInfo

    return {
      groups: groups.slice(0, 3),
      pageInfo: groupsPageInfo
    }
  } catch (error) {
    next(createError(error.response?.status || 500, error.message))
  }
}
