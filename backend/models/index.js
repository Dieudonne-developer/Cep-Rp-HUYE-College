// Legacy index kept for seed scripts; primary models live as individual files.
const UserRegistration = require('./UserRegistration');
const ChatMessage = require('./ChatMessage');

module.exports = {
  User: UserRegistration,
  ChatMessage,
};
