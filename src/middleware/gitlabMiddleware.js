/**
 * Gitlab middleware.
 *
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import axios from 'axios'
import createError from 'http-errors'

/**
 * Initiates OAuth flow.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - Promise that resolves when the function is complete.
 */
export async function initiateOAuth (req, res, next) {
  try {
    const authorizationEndpoint = 'https://gitlab.lnu.se/oauth/authorize'
    const clientID = process.env.APP_ID
    const redirectURI = process.env.REDIRECT_URI
    const scope = ['read_api', 'read_user', 'read_repository', 'openid'].join('+')
    const responseType = 'code'

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(7)

    if (!clientID) {
      console.error('Missing APP_ID environment variable')
      return next(createError(500, 'Client ID is not set'))
    }

    // Save state in the session for later verification in callback
    req.session.state = state

    const oauthUrl = `${authorizationEndpoint}?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=${responseType}&state=${state}&scope=${scope}`

    // Save session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err)
        return next(createError(500, 'Failed to save session'))
      }
      console.log('Session saved successfully')
      console.log('  - Session after save:', req.session)
      console.log('Redirecting to OAuth URL:', oauthUrl)
      // Redirect the user to the OAuth authentication page
      res.redirect(oauthUrl)
    })
  } catch (error) {
    next(createError(500, error.message || 'Internal Server Error'))
  }
}

/**
 * Completes OAuth flow by exchanging the authorization code for an access token.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - Promise that resolves when the function is complete.
 */
export async function handleOAuthCallback (req, res, next) {
  try {
    const code = req.query.code
    const state = req.query.state

    // Debug logs
    console.log('Callback received:')
    console.log('  - Query state:', state)
    console.log('  - Session state:', req.session.state)
    console.log('  - Session ID:', req.sessionID)

    // Validate CSRF protection using the state parameter
    if (!state || state !== req.session.state) {
      console.error('State mismatch!')
      return next(createError(400, 'Invalid state parameter - possible CSRF attack'))
    }

    // Validate CSRF protection using the state parameter
    if (!state || state !== req.session.state) {
      return next(createError(400, 'Invalid state parameter - possible CSRF attack'))
    }

    // Clear the state from session after validation
    delete req.session.state

    if (!code) {
      return next(createError(400, 'Authorization code is missing'))
    }

    const clientID = process.env.APP_ID
    const clientSecret = process.env.GITLAB_CLIENT_SECRET
    const redirectURI = process.env.REDIRECT_URI

    const parameters = new URLSearchParams({
      client_id: clientID,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectURI
    })

    // Exchange the authorization code for an access token
    const response = await axios.post('https://gitlab.lnu.se/oauth/token', parameters)

    // Save the credentials in the session
    req.session.creds = response.data

    next()
  } catch (error) {
    next(createError(500, error.message || 'Internal Server Error'))
  }
}

/**
 * Fetches Gitlab user information and saves to session.
 *
 * @param {object} req  Express request object
 * @param {object} res Express response object
 * @param {Function} next Express next function
 * @returns {Promise<void>} - Promise that resolves when the function is complete.
 */
export async function fetchGitLabUserData (req, res, next) {
  const accessToken = req.session.creds.access_token
  if (!accessToken) {
    console.error('Access token saknas')
    return next(createError(401, 'Access token saknas'))
  }
  const apiUrl = `https://gitlab.lnu.se/api/v4/user?access_token=${accessToken}`
  try {
    const response = await axios.get(apiUrl)
    req.session.user = {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name,
      username: response.data.username,
      avatar: response.data.avatar_url,
      lao: response.data.last_activity_on
    }
  } catch (error) {
    next(createError(500, error.message || 'Internal Server Error'))
  }
  next()
}
