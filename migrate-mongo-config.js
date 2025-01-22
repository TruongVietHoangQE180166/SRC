const path = require('path');
require('dotenv').config();

const config = {
  mongodb: {
    url: process.env.DATABASE_URL,
    databaseName: 'App',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: path.join(__dirname, 'src/database/migrations'), // Đường dẫn tuyệt đối
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
