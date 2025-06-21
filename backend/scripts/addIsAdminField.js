const { usersCollection, initializeDbConnection } = require("../src/db");


async function addIsAdminField() {
  try {
    await initializeDbConnection();
    const users = usersCollection();
    const result = await users.updateMany(
      { isAdmin: { $exists: false } },
      { $set: { isAdmin: false } }
    );
    console.log(`✅ Updated ${result.modifiedCount} users with isAdmin: false`);
  } catch (error) {
    console.error('❌ Error updating users:', error.message);
  }
}

addIsAdminField();