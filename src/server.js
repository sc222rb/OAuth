/**
 * @file The server module.
 * @module server
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import session from 'express-session'
import helmet from 'helmet'
import logger from 'morgan'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sessionOptions } from './config/sessionOptions.js'
import { router } from './routes/router.js'

try {
  const app = express()

  // Get the directory name of this module's path.
  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  // Set the base URL to use for all relative URLs in a document.
  const baseURL = process.env.BASE_URL || '/'

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          'cdn.jsdelivr.net'
        ],
        'img-src': ["'self'", 'gitlab.lnu.se', '*.gravatar.com', 'data:']
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
  })
  )

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // View engine setup.
  app.set('view engine', 'ejs')
  app.set('views', join(directoryFullName, 'views'))
  app.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))
  app.set('layout extractScripts', true)
  app.set('layout extractStyles', true)
  app.use(expressLayouts)

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // Serve static files.
  app.use(express.static(join(directoryFullName, '..', 'public')))

  // Setup and use session middleware (https://github.com/expressjs/session)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1) // trust first proxy
  }
  app.use(session(sessionOptions))

  // Parse requests of the content type application/json.
  app.use(express.json())

  // Middleware to be executed before the routes.
  app.use((req, res, next) => {
    // Pass the base URL to the views.
    res.locals.baseURL = baseURL

    next()
  })

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use((err, req, res, next) => {
    console.error(err)

    /**
     * Sends the specified error page with the given status code.
     *
     * @param {number} statusCode The HTTP status code to send.
     * @param {string} errorPage The filename of the error page to send.
     * @returns {void}
     */
    const sendErrorPage = (statusCode, errorPage) => {
      return res.status(statusCode).sendFile(join(directoryFullName, 'views', 'errors', errorPage))
    }

    // Handle specific error statuses
    switch (err.status) {
      case 400:
        return sendErrorPage(400, '400.html')
      case 401:
        return sendErrorPage(401, '401.html')
      case 403:
        return sendErrorPage(403, '403.html')
      case 404:
        return sendErrorPage(404, '404.html')
      default:
        // 500 Internal Server Error (in production, all other errors send this response).
        if (process.env.NODE_ENV === 'production') {
          return sendErrorPage(500, '500.html')
        }

        // ---------------------------------------------------
        // ⚠️ WARNING: Development Environment Only!
        // Detailed error information is provided.
        // ---------------------------------------------------

        // Render a generic error page for other errors in development
        res.status(err.status || 500).render('errors/error', { error: err })
        break
    }
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
