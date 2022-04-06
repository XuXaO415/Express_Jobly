"user strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadExpressError } = require("../expressError");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = express.Router();