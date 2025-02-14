#!/usr/bin/env node

const { sequelize, AidRequest } = require('../backend/db');

// Add "references" column if not present
async function addReferencesColumn() {
  const [results] = await sequelize.query(`PRAGMA table_info("AidRequest");`);
  const hasReferences = results.find((col) => col.name === 'references');
  if (!hasReferences) {
    await sequelize.query(`ALTER TABLE "AidRequest" ADD COLUMN "references" TEXT;`);
    console.log('Column "references" added successfully.');
  } else {
    console.log('Column "references" already exists. No changes made.');
  }
}

// Add "location" column if not present
async function addLocationColumn() {
  const [results] = await sequelize.query(`PRAGMA table_info("AidRequest");`);
  const hasLocation = results.find((col) => col.name === 'location');
  if (!hasLocation) {
    await sequelize.query(`ALTER TABLE "AidRequest" ADD COLUMN "location" TEXT;`);
    console.log('Column "location" added successfully.');
  } else {
    console.log('Column "location" already exists. No changes made.');
  }
}

// Add "receiveDetails" column if not present
async function addReceiveDetailsColumn() {
  const [results] = await sequelize.query(`PRAGMA table_info("AidRequest");`);
  const hasReceiveDetails = results.find((col) => col.name === 'receiveDetails');
  if (!hasReceiveDetails) {
    await sequelize.query(`ALTER TABLE "AidRequest" ADD COLUMN "receiveDetails" TEXT;`);
    console.log('Column "receiveDetails" added successfully.');
  } else {
    console.log('Column "receiveDetails" already exists. No changes made.');
  }
}

// Update AidRequest state from "InReview" to "Submitted"
async function updateAidRequests() {
  const [affectedCount] = await AidRequest.update(
    { state: "Submitted" },
    { where: { state: "InReview" } }
  );
  console.log(`Updated ${affectedCount} AidRequest(s) from "InReview" to "Submitted".`);
}

async function main() {
  try {
    await updateAidRequests();
    await addReferencesColumn();
    await addLocationColumn();
    await addReceiveDetailsColumn();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

main();
