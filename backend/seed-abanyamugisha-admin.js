const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const User = require('./models/AbanyamugishaUser');

withDatabase(() =>
  ensureAdmin(User, {
    email: 'abanyamugisha.admin@cep-huye.org',
    username: 'abanyamugisha-admin',
    password: 'abanyamugisha123',
    group: 'abanyamugisha',
  })
);
