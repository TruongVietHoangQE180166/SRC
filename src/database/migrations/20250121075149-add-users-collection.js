'use strict';

module.exports = {
  async up(db, client) {
    try {

      const collection = db.collection('useraccounts');

      const result = await collection.updateMany(
        {},
        {
          $set: {
            isVerifier: true,
          },
        }
      );
      console.log(`Updated ${result.modifiedCount} documents`);
    } catch (error) {
      console.error('Migration up error:', error);
      throw error;
    }
  },

  async down(db, client) {
    try {

      const collection = db.collection('useraccounts');

      const result = await collection.updateMany(
        {},
        {
          $unset: {
            isVerifier: "",
          },
        }
      );
      console.log(`Reverted ${result.modifiedCount} documents`);
    } catch (error) {
      console.error('Migration down error:', error);
      throw error;
    }
  }
};