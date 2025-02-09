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
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

main();
