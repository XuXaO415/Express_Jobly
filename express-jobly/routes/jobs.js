"user strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadExpressError } = require("../expressError");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const { ensureAdmin } = require("../middleware/auth");
const { async } = require("../models/company");

const router = express.Router();

/** POST / {job} => {job}
 * 
 *  job data should be {title, salary, equity, companyHandle }
 * 
 * returns { id, title, salary, equity, companyHandle }
 * 
 * authorization required: Admin
 */

router.post("/", ensureAdmin, async function() {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadExpressError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});