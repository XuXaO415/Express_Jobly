const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");



/***************************************/


// describe("sqlForPartialUpdate", function() {
//     test("tests if user has email", function() {
//         const users = {
//             username: "testUser1",
//             first_name: "Rick",
//             last_name: "Sanchez",
//         }

//         const data = { email: "u1@email.com" };
//         const output = sqlForPartialUpdate(data, users);
//         // expect(output).toEqual({ data, users })
//         expect(output).toEqual({
//             setCols: "\"email\"=$1",
//             values: ["u1@email.com"]
//         });
//     });
//     test("No data, should throw a 400 error", function() {
//         try {
//             const keys = {};
//             const data = {};
//             const output = sqlForPartialUpdate(keys, data);
//             expect(output).toBeDefined();
//             expect(output).toBeFalsy();
//         } catch (e) {
//             expect(sqlForPartialUpdate).toBeTruthy();
//         }
//     });
// });


describe("sqlForPartialUpdate", function() {
    test("works: 1 item", function() {
        const result = sqlForPartialUpdate({ f1: "v1" }, { f1: "f1", fF2: "f2" });
        expect(result).toEqual({
            setCols: '"f1"=$1',
            values: ["v1"],
        });
    });

    test("works: 2 items", function() {
        const result = sqlForPartialUpdate({ f1: "v1", jsF2: "v2" }, { jsF2: "f2" });
        expect(result).toEqual({
            setCols: '"f1"=$1, "f2"=$2',
            values: ["v1", "v2"],
        });
    });
});