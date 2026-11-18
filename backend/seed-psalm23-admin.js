const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const User = require('./models/Psalm23User');

withDatabase(() =>
  ensureAdmin(User, {
    email: 'psalm23.admin@cep-huye.org',
    username: 'psalm23-admin',
    password: 'psalm23123',
    group: 'psalm23',
  })
);
