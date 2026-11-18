const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const User = require('./models/Psalm46User');

withDatabase(() =>
  ensureAdmin(User, {
    email: 'psalm46.admin@cep-huye.org',
    username: 'psalm46-admin',
    password: 'psalm46123',
    group: 'psalm46',
  })
);
