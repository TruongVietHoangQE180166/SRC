module.exports = {
  async up(db) {
    
    await db.collection('useraccounts').updateMany(
      {},
      {
        $set: {
          isVerifier: true,
        },
      }
    );
  },

  async down(db) {
   
    await db.collection('useraccounts').updateMany(
      {},
      {
        $unset: {
          isVerifier: "",
        },
      }
    );
  }
};