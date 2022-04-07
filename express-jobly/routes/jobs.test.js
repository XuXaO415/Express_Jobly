"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Job = require("../models/jobs");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
} = require("./_testCommon");
const { async } = require("../models/jobs.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function() {
    const newJob = {
        title: "s1",
        salary: 100000,
        equity: 0,
        companyHandle: "s1"
    };
    test("ok for users", async function() {
        const res = await request(app)
            .post(`/jobs`)
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            job: newJob,
        });
    });
    test("bad request w/t missing data", async function() {
        const res = await request(app)
            .post(`/jobs`)
            .send({
                salary: 100000,
                equity: 0,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(400);
    });
    test("bad request with invalid data", async function() {
        const res = await request(app)
            .post(`/jobs`)
            .send({
                ...newJob,
                salary: "Big $$$",
                equity: "3.14159265359",
            })
            .set("authorization", `Bearer${u2Token}`);
        expect(res.statusCode).toEqual(400);
    });
});
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
                    equity: "3.14",
                    companyHandle: "c1",
                    companyHandle: "C1",
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
    test("filter by title", async function() {
        const res = await request(app)
            .get(`/jobs?title=j1`);
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "J1",
                salary: 1,
                equity: "3.14",
                companyHandle: "c1",
                companyName: "C1",
            }],
        });

    })
})