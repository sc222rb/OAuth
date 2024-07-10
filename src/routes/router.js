/**
 * @file Defines the main router.
 * @module router
 * @author Sayaka Chishiki Jakobsson
 */

import express from 'express'
import { router as homeRouter } from './homeRouter.js'
import { router as accountRouter } from './accountRouter.js'
import { router as userRouter } from './userRouter.js'
import createError from 'http-errors'

export const router = express.Router()

router.use('/', homeRouter)
router.use('/auth', accountRouter)
router.use('/user', userRouter)

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => {
  next(createError(404))
})
