/**
 * @file Defines the main router.
 * @module router
 * @author Sayaka Chishiki Jakobsson
 */

import express from 'express'

import createError from 'http-errors'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to version 1 of this very simple RESTful API!' }))

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => {
  next(createError(404))
})
