

const { initializeDbConnection, usersCollection } = require("../src/db");


async function setInitialAdmin() {
  try {
    await initializeDbConnection();
    const users = usersCollection();
    const userId = 'JVKI6dZU46dDjoPn66ngKBKcyJM2'; 
    const result = await users.updateOne(
      { id: userId },
      { $set: { isAdmin: true } }
    );
    console.log(`Updated ${result.modifiedCount} user to admin: ${userId}`);
  } catch (error) {
    console.error('Error setting initial admin:', error);
  }
}

setInitialAdmin();