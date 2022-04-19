"user strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadExpressError, BadRequestError } = require("../expressError");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
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

router.post("/", ensureAdmin, async function(req, res, next) {
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


/** GET / { jobs: [{id, title, salary, equity, companyHandle, companyName }, ...]}
 * 
 * Can search filter in query:
 * 
 * title - filter by job title (case-insensitive, partial matches)
 * minSalary - filter to jobs w/t @ least that salary
 * hasEquity - if true, filter to jobs that have non-zero equity. If false or not included in the filtering,
 * list all jobs.
 * 
 * Authorization req: none
 * 
 * refs jobSearchSchema
 */

router.get("/", async function(req, res, next) {
    try {
        const q = req.query;
        if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
        q.hasEquity = q.hasEquity === "true";
        const validator = jsonschema.validate(q, jobSearchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const jobs = await Job.findAll(q);
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

/** GET /[jobId] => { job }
 *
 * Returns { id, title, salary, equity, company }
 *   where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/:id", async function(req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});
/** Cross reference and pattern match routes/companies /:handle line 120
 * 
 *  Update in job.update
 */
router.patch("/:id", async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** Pattern match  delete /:id */
router.delete("/:id", async function(req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;