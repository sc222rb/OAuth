/**
 * API version 1 routes.
 *
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import express from 'express'
import { AccountController } from '../../src/controllers/api/AccountController.js'
import { initiateOAuth, handleOAuthCallback, fetchGitLabUserData } from '../middleware/gitlabMiddleware.js'

export const router = express.Router()

const controller = new AccountController()

// Map HTTP verbs and route paths to controller actions.

// initiateOAuth
router.get('/initiateOAuth', (req, res, next) => initiateOAuth(req, res, next))

// Callback
router.get(
  '/gitlab/callback',
  (req, res, next) => handleOAuthCallback(req, res, next),
  (req, res, next) => fetchGitLabUserData(req, res, next),
  (req, res, next) => controller.redirect(req, res, next))

// Log out
router.get('/logout', (req, res) => controller.logout(req, res))
