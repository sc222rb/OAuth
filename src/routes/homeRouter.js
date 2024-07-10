/**
 * @file Defines the home router.
 * @module homeRouter
 * @author Sayaka Chishiki Jakobsson
 */

import express from 'express'
import { HomeController } from '../../src/controllers/api/HomeController.js'

export const router = express.Router()

const controller = new HomeController()

router.get('/', (req, res, next) => controller.index(req, res, next))
