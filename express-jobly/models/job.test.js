"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Job = require("./job");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
} = require("./_testCommon");
const { request } = require("../app");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create
 * 
 * Modeled after models/company.test.js
 */
describe("create", function() {

    test("works", async function() {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            newJob: [{
                    //from solutions
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1000,
                    equity: "3.14",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2000,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 3000,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ],
        });
    })
});

/************************************** findAll */

describe("findAll", function() {
    test("works: no filter", async function() {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([{
                id: testJobIds[0],
                title: "J1",
                salary: 1000,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C2",
            },
            {
                id: testJobIds[1],
                title: "J2",
                salary: 2000,
                equity: "0.2",
                companyHandle: "c2",
                companyName: "C2",
            },
            {
                id: testJobIds[3],
                title: "J3",
                salary: 3000,
                equity: "0.3",
                companyHandle: "c3",
                companyName: "C3",
            },
            {
                id: testJobIds[4],
                title: "J4",
                salary: 4000,
                equity: "0.4",
                companyHandle: "c4",
                companyName: "C4",
            },
            {
                id: testJobIds[5],
                title: "J5",
                salary: NULL,
                equity: NULL,
                companyHandle: "c5",
                companyName: "C5",
            },
        ]);
    });
});

/************************************** get */

describe("GET", function() {
    test("works for users", async function() {
        const job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "J1",
            salary: 100,
            equity: "0.1",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
        });
    });
    test("not found if no such job", async function() {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

/************************************** remove */

describe("remove", function() {
    test("works", async function() {
        await Job.remove(testJobIds[0]);
        const res = await db.query(
            `SELECT id FROM jobs WHERE id = $1`, [testJobIds[0]]
        );
        expect(res.rows.length).toEqual(0);
    })
    test("not found if no such job", async function() {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruth();
        }
    });
});