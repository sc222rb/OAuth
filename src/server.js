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
import 'dotenv/config'

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

    // Set default status code
    const statusCode = err.status || 500

    // Prepare error object for view
    const errorObject = {
      status: statusCode,
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    }

    // In production, don't expose stack traces
    if (process.env.NODE_ENV === 'production') {
      // Generic error messages for production
      switch (statusCode) {
        case 400:
          errorObject.message = 'Bad Request'
          break
        case 401:
          errorObject.message = 'Unauthorized'
          break
        case 403:
          errorObject.message = 'Forbidden'
          break
        case 404:
          errorObject.message = 'Not Found'
          break
        case 500:
        default:
          errorObject.message = 'Internal Server Error'
          break
      }
    }

    // Prepare viewData for the layout (header needs it)
    const viewData = {
      user: req.session?.user || null
    }

    // Render the error page with both error and viewData
    res.status(statusCode).render('errors/error', { error: errorObject, viewData })
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
