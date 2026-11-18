const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const User = require('./models/EvangelicalUser');

withDatabase(() =>
  ensureAdmin(User, {
    email: 'evangelical.admin@cep-huye.org',
    username: 'evangelical-admin',
    password: 'evangelical123',
    group: 'evangelical',
  })
);
