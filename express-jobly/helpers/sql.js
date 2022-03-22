const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    //Object.keys() method gets an array of object's key
    //enumerates through updatable data objects/properties in db i.e company, jobs, applications
    const keys = Object.keys(dataToUpdate);
    // if keys are empty, throw error that states no data (ex: applications in db is empty, this would throw an 400 error)
    if (keys.length === 0) throw new BadRequestError("No data");

    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    // iterates through array/objects in index and column elements and assigns variable to string literal
    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );

    return {
        //combines/joins columns
        setCols: cols.join(", "),
        // ennumerates through array properties/data and updates keys
        values: Object.values(dataToUpdate),
    };
}

module.exports = { sqlForPartialUpdate };