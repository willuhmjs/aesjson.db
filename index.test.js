const fs = require('fs');
const assert = require('assert');
const crypto = require('crypto');
const Database = require('./index');

// Define test data
const testData = {
  name: 'John Doe',
  age: 42,
  email: 'john.doe@example.com',
};

// Define test file path and password
const testFilePath = crypto.randomBytes(8).toString('hex');
const testPassword = crypto.randomBytes(8).toString('hex');

// Define a function to cleanup the test file
const cleanupTestDatabase = () => {
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }
};

// Define a test function
const testDatabase = () => {
  // Initialize the database with test file and password
  const db = new Database(testFilePath, testPassword);

  // Set the test data
  db.set('test', testData);

  // Verify the data is set correctly
  assert.deepStrictEqual(db.get('test'), testData);

  // Create a new instance of the database with the same file and password
  const db2 = new Database(testFilePath, testPassword);

  // Verify that the data can be loaded and decrypted correctly
  assert.deepStrictEqual(db2.get('test'), testData);
};

// Run the test
try {
    testDatabase();
} catch (e) {
    cleanupTestDatabase();
    throw e;
}
cleanupTestDatabase();