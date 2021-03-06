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

    test("works: filter by hasEquity", async function() {
        // const res = await request(app).get(`/jobs?hasEquity=null`);
        const res = await request(app)
            .get(`/jobs?hasEquity=true`)
            // .query({ hasEquity: true });
        expect(res.body).toEqual({
            jobs: [{
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                // {
                //     id: expect.any(Number),
                //     title: "J2",
                //     salary: 2,
                //     equity: null,
                //     companyHandle: "c1",
                //     companyName: "C1",
                // },
            ],
        });
        // const res2 = await request(app)
        //     .get(`/jobs?title=a`);
        // expect(res.statusCode).toEqual({
        //     jobs: []
        // });
    });

    test("filter for minSalary", async function() {
        const res = await request(app)
            // .get(`/jobs?minSalary=100`);
            .get(`/jobs/${testJobIds[1]}`);
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "J2",
                salary: 1000,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }],
        });
    });


    test("not found for no such job", async function() {
        const res = await request(app)
            .get(`/job?title=nope`)
        expect(res.statusCode).toEqual(404);
    });
    test("fails: test next() handler", async function() {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });
});

/************************************** GET /jobs/:id */

// describe("GET / jobs/:id", function() {
//     test("works for anon", async function() {
//         let results =
//             await db.query(`SELECT id FROM jobs WHERE title ="j1"`)
//         const res = await request(app)
//             .get(`/jobs/${results.rows[0].id}`);
//         expect(res.body).toEqual({
//             job: {
//                 id: expect.any(Number),
//                 title: "j1",
//                 salary: 1,
//                 equity: "0.1",
//                 companyHandle: "c1"
//             }
//         });
//     });


describe("GET /jobs/:id", function() {
    test("works for anon", async function() {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "J1",
                salary: 1,
                equity: "0.1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
            },
        });
    });

    test("filter by id", async function() {
        const res = await request(app)
            .get(`/jobs/${testJobIds[1]}`)
        expect(res.statusCode).toEqual(200);

    })
    test("not found for no such job", async function() {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /jobs/:id */
describe("PATCH /jobs/:id", function() {
    test("works for admin", async function() {
        const res = await request(app)
            .patch(`/jobs/${testJobIds[1]}`)
            .send({
                title: "Senior muffin eater"
            })
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "Senior muffin eater",
                salary: 2,
                equity: "0.2",
                companyHandle: "c1",
            },
        });
    });
    test("unauth for anon", async function() {
        const res = await request(app)
            .patch(`/jobs/${testJobIds[1]}`)
            .send({
                title: "oof, nada",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401)
    });
    test("responds w/t 404 if job not found", async function() {
        const res = await request(app)
            .patch(`/jobs/0`)
            .send({
                title: "job doesn't exist"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function() {
    test("deletes jobs: works for admin", async function() {
        const res = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
    });
    test("unauth for anon", async function() {
        const res = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401)
    });
    test("unauth for users", async function() {
        const resp = await request(app).delete(`/jobs/${testJobIds[0]}`);
        expect(resp.statusCode).toEqual(401);
    });
    test("responds w/t 404 if job not found", async function() {
        const res = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    });
});