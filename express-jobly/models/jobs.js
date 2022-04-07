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
                RETURNING id, title, salary, equity, company_handle AS "companyHandle"`, [
                    data.title,
                    data.salary,
                    data.equity,
                    data.companyHandle
                ]);
            const job = result.rows[0];
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
        const query =
            `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle",
                FROM jobs
                ORDER by title`;
        let { queryExpression, queryValues } = [];
        //checks if title is not equal to undefined
        if (title !== undefined) {
            // push title to end of arr
            queryValues.push(`%${title}%`);
            //returns new length
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
        if (!jobs) throw new NotFoundError(`Job: ${id} cannot be found`);
        return job;
    }
}

module.exports = Job;