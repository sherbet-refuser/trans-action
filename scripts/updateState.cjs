#!/usr/bin/env node

const { sequelize, AidRequest } = require('../backend/db');

async function main() {
  try {
    const [affectedCount] = await AidRequest.update(
      { state: "Submitted" },
      { where: { state: "InReview" } }
    );
    console.log(`Updated ${affectedCount} AidRequest(s) from "InReview" to "Submitted".`);
  } catch (error) {
    console.error("Error updating AidRequests:", error);
  } finally {
    await sequelize.close();
  }
}

main();
