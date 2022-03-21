const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("../models/_testCommon");

process.env.NODE_ENV !== "test"

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterEach(commonAfterEach);
afterAll(commonAfterAll);


/***************************************/

// describe("Set up for tests ", function() {
//     beforeAll(function() {
//         console.log("Run before all tests start")
//     })

//     beforeEach(function() {
//         console.log("Run before each test")
//     })

//     afterEach(function() {
//         console.log("Run after each test")
//     })
//     afterAll(function() {
//         console.log("Run after all tests")
//     });
// });

describe("sqlForPartialUpdate", function() {
    test("tests if user has email", async function() {
        const users = {
            username: "testUser1",
            first_name: "Rick",
            last_name: "Sanchez",
        }

        const data = { email: "u1@email.com" };
        const output = sqlForPartialUpdate(data, users);
        // expect(output).toEqual({ data, users })
        expect(output).toEqual({
            setCols: "\"email\"=$1",
            values: ["u1@email.com"]
        })
    });
});