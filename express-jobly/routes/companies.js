"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companyFilterSchema = require("../schemas/companyFilter.json");
const db = require("../db");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, companyNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const company = await Company.create(req.body);
        return res.status(201).json({ company });
    } catch (err) {
        return next(err);
    }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches) --regex matchers
 *
 * Authorization required: none
 * 
 * ** ADD a feature that allows a user to filter the results based on optional filtering criteria...look at lines 45-48 **
 */


router.get("/", async function(req, res, next) {
    try {
        const filter = req.query;
        if (filter.minEmployees) {
            filter.minEmployees = (+filter.minEmployees);
        };
        if (filter.maxEmployees) {
            filter.maxEmployees = (+filter.maxEmployees);
        };
        const validator = jsonschema.validate(filter, companyFilterSchema);
        // pass validation errors to error-handler
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);

        }
        const companies = await Company.findAll(filter);
        return res.json({ companies, filter });
    } catch (err) {
        return next(err);
    }
});
// router.get("/", async function(req, res, next) {
//     try {
//         let companies;
//         const { minEmployees, maxEmployees, nameLike } = req.query;
//         if (!minEmployees && !maxEmployees && !nameLike) {
//             companies = await Company.findAll(req.query);
//         } else {
//             companies = await Company.findAll(filter);
//         }
//         return res.json({ companies });
//     } catch (err) {
//         return next(err);
//     }
// });

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function(req, res, next) {
    try {
        const company = await Company.get(req.params.handle);
        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, companyUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const company = await Company.update(req.params.handle, req.body);
        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        await Company.remove(req.params.handle);
        return res.json({ deleted: req.params.handle });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;