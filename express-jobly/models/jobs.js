"user strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlCompanyFilter } = require("../helpers/sql");

/** Related fxns for companies */

class Job {
    /** Create a job (from data), update db, return new job data. 
     * 
     * data should be (from jobly-schema) { title, salary, equity, companyHandle }
     * 
     *  Returns {id, title, salary, equity, companyHandle }
     * 
     * 
     * SIDE NOTE, the db uses the NUMERIC field type because this allows for exact precision and scale,
     * whereas, the FLOAT is approximate.
     */
    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, companyHandle)
            VALUES($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [data.title,
            data.salary,
            data.equity,
            data.companyHandle
            ]);
            const job = result.rows[0];
            return job;
    }
}