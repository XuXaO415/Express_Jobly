"user strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlCompanyFilter } = require("../helpers/sql");
const { remove } = require("./company");

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
                (title, salary, equity, company_handle)
                VALUES($1, $2, $3, $4)
                RETURNING id, title, salary, equity, company_handle AS "companyHandle"`, [data.title, data.salary, data.equity, data.companyHandle]
            );
            let job = result.rows[0];
            return job;
        }
        /** Find all jobs -- Added filter option.
         *
         * Possible filters:
         *  title - filter by job title (case-insensitive, matches any part of a string search)
         *  minSalary - filter to jobs w/t @ least that salary
         *  hasEquity - if true, filter to jobs that have non-zero equity. If false or not included in the filtering,
         *  list all jobs
         *
         * Returns [{id, title, salary, equity, companyHandle}, ...]
         */

    static async findAll({ title, minSalary, hasEquity } = {}) {
        let query = `SELECT j.id,
                j.title,
                j.salary,
                j.equity,
                j.company_handle AS "companyHandle"
                c.name AS companyName,
                FROM jobs AS j
                LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let { queryExpression, queryValues } = [];
        // const { title, minSalary, hasEquity } = searchFilter;
        //checks if title is not equal to undefined
        if (title !== undefined) {
            // push title to end of arr
            queryValues.push(`%${title}%`);
            //returns new query results
            queryExpression.push(`title ILIKE ${queryValues.length}`);
        }
        if (minSalary !== undefined) {
            queryValues.push(minSalary);
            // if salary is greater/equal to query input, push arr to queryExpression
            queryExpression.push(`salary >= ${queryValues.length}`);
        }
        // hasEquity is equal, returns boolean result
        if (hasEquity === true) {
            queryExpression.push(`equity > 0`);
        }
        // if elements in arr are greater than 0
        if (queryExpression.length > 0) {
            // adds & joins query to db
            query += "WHERE " + queryExpression.join(" AND ");
        }
        //Finalize query & returns query results in order by title

        query += " ODER BY title";
        const jobsRes = await db.query(query, queryValues);
        return jobsRes.rows;
    }

    /** ADD id -- REFERENCE ../models/company starting @ line 69 */
    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
            title, 
            salary,
            equity,
            company_handle AS companyHandle
            FROM jobs
            WHERE id = $1`, [id]
        );
        const job = jobRes.row[0];
        if (!job) throw new NotFoundError(`Job ${id} not found`);
        const companyRes = await db.query(
            `SELECT handle,
            name,
            description,
            num_employees AS "numEmployees,
            logo_url AS "logoUrl"
            FROM companies 
            WHERE handle = $1`, [job.companyHandle]
        );

        // This section is gathered from the solutions page
        delete job.companyHandle;
        job.company = companyRes.rows[0];
        return job;
    }

    /** Updates job data with`data`.
            
                This is a "partial update" --- acceptable if data doesn't contain all the fields;
                this only changes provides ones.
            
                Data can include: {title, salary, equity } 
                Returns {id, title, salary, equity, companyHandle }
            
                Throws NotFoundError if not found. 
            
                */

    static async update(data, id) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const idVarIdx = "$" + (values.length + 1);
        const querySql = `UPDATE jobs
            SET ${setCols}
            WHERE id = ${idVarIdx}
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
        const result = await await db.query(querySql, [...values, id]);
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`Job: ${id} cannot be found`);
        return job;
    }

    /** Delete given job from db; returns undefined
     *
     * Throws NotFoundError if job not found
     */

    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROM jobs 
            WHERE id = $1
            RETURNING id`, [id]);

        const job = result.rows[0];

        if (!job) throw new NotFoundError(`Job with ${id} not found`);
    }
}

module.exports = Job;