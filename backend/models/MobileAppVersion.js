const { DataTypes } = require('sequelize');
const sequelize = require('../src/db/connection');

const MobileAppVersion = sequelize.define('MobileAppVersion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  appType: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  versionCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  downloadUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  uploadedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  releaseNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = MobileAppVersion;
