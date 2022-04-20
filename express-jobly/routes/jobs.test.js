"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
// const Job = require("../models/jobs");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
    testJobIds,
} = require("./_testCommon");
const { async } = require("../models/job");
const { set } = require("../app");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs
 * 
 * Modeled after routes/company.test.js
 * -- Re-wrote tests for this section
 */


describe("POST /jobs", function() {
    test("ok for admin", async function() {
        const resp = await request(app)
            .post(`/jobs`)
            .send({
                companyHandle: "c1",
                title: "New-job-post",
                salary: 10,
                equity: "0.2",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "New-job-post",
                salary: 10,
                equity: "0.2",
                companyHandle: "c1",
            },
        });
    });

    // Why does this test fail?
    // describe("POST /jobs", function() {
    //     test("works for admin", async function() {
    //         const res = await request(app)
    //             .post(`/jobs`)
    //             .send({
    //                 title: "New Job Post",
    //                 salary: 1000,
    //                 equity: "0.2",
    //                 companyHandle: "c1",
    //             })
    //             .set("authorization", `Bearer ${adminToken}`);
    //         expect(res.statusCode).toEqual(201);
    //         expect(res.body).toEqual({
    //             job: {
    //                 id: expect.any(Number),
    //                 title: "s1",
    //                 salary: 1000,
    //                 equity: "0.2",
    //                 companyHandle: "c2",
    //             },
    //         });
    //     });

    test("unauth for anon", async function() {
        const res = await request(app).post(`/jobs`)
            .send({
                title: "s1",
                salary: 1000,
                equity: "0.2",
                companyHandle: "c2",
            })
            .set("authorization", `Bearer ${u2Token}`);
        expect(res.statusCode).toEqual(401);
    });
});

// describe("POST /jobs", function() {
//     const newJob = {
//         title: "s1",
//         salary: 100000,
//         equity: 0,
//         companyHandle: "s1"
//     };

//     test("ok for admin", async function() {
//         const res = await request(app)
//             .post(`/jobs`)
//             .send(newJob)
//             .set("authorization", `Bearer ${adminToken}`)
//         expect(res.statusCode).toEqual(201);
//         expect(res.body).toEqual({
//             job: newJob,
//         });
//     })
//     test("ok for users", async function() {
//         const res = await request(app)
//             .post(`/jobs`)
//             .send(newJob)
//             .set("authorization", `Bearer ${u1Token}`);
//         expect(res.statusCode).toEqual(401);
//         expect(res.body).toEqual({
//             job: newJob,
//         });
//     });
//     test("bad request w/t missing data", async function() {
//         const res = await request(app)
//             .post(`/jobs`)
//             .send({
//                 salary: 100000,
//                 equity: 0,
//             })
//             .set("authorization", `Bearer ${adminToken}`);
//         expect(res.statusCode).toEqual(400);
//     });
//     test("bad request with invalid data", async function() {
//         const res = await request(app)
//             .post(`/jobs`)
//             .send({
//                 ...newJob,
//                 salary: "Big $$$",
//                 equity: "3.14159265359",
//             })
//             .set("authorization", `Bearer${adminToken}`);
//         expect(res.statusCode).toEqual(400);
//     });
// });
/************************************** GET /jobs */
describe("GET /jobs", function() {
    test("works for anon", async function() {
        const res = await request(app).get(`/jobs`);
        expect(res.body).toEqual({
            jobs: [{
                    //from solutions
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ],
        });
    });

    test("works: filter by title", async function() {
        // const res = await request(app).get(`/jobs?title=j1`);
        const res = await request(app)
            .get(`/jobs`)
            .query({ title: "j1" });
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "J1",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",
            }, ],
        });
        const res2 = await request(app)
            .get(`/jobs?title=a`);
        expect(res.statusCode).toEqual({
            jobs: []
        });
    });

    test("filter for minSalary", async function() {
        const res = await request(app)
            .get(`/jobs?minSalary=2454`);
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "J2",
                salary: 2,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }],
        });
    });

    test("filter hasEquity", async function() {
        const res = await request(app)
            .get(`/jobs?hasEquity=true`);
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "J2",
                salary: 2,
                equity: "0.2",
                companyHandle: "c1",
            }, {
                id: expect.any(Number),
                title: "J1",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",
            }],
        });
    });

    test("not found for no such job", async function() {
        const res = await request(app)
            .get(`/jobs?name=nope`)
        expect(res.statusCode).toEqual(404);
    });
});

/************************************** GET /jobs/:id */

describe("GET / jobs/:id", function() {
    test("works for anon", async function() {
        let results =
            await db.query(`SELECT id FROM jobs WHERE title ="j1"`)
        const res = await request(app)
            .get(`/jobs/${results.rows[0].id}`);
        expect(res.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "j1",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1"
            }
        });
    });
    test("not found for no such job", async function() {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /jobs/:id */

/************************************** DELETE /jobs/:id */
/************************************** DELETE /jobs/:id */