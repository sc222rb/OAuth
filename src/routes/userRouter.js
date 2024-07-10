/**
 * @file Defines the user router.
 * @module userRouter
 * @author Sayaka Chishiki Jakobsson
 */

import express from 'express'
import { UserController } from '../../src/controllers/api/UserController.js'

export const router = express.Router()

const controller = new UserController()

// Map HTTP verbs and route paths to controller actions.

// show profile page
router.get('/profile', (req, res, next) => controller.showProfile(req, res, next))
