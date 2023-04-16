const Database = require("./index");
const fs = require("fs");
const assert = require("assert");

// prepare a database
const databaseName = Math.random().toString(36).substring(7);
const password = Math.random().toString(36).substring(7);
const db = new Database(`${databaseName}.db`, password);

const cleanUp = () => fs.unlinkSync(`${databaseName}.db`);

try {
    assert.equal(db.get("foo"), undefined);

    db.set("foo", "bar");
    assert.equal(db.get("foo"), "bar");

    db.delete("foo");
    assert.equal(db.get("foo"), undefined);
    cleanUp();

    console.log("Tests passed!");
} catch (e) {
    cleanUp();
    throw e;
}
