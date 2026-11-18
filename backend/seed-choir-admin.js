const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const ChoirUser = require('./models/UserRegistration');

withDatabase(() =>
  ensureAdmin(ChoirUser, {
    email: 'choir.admin@cep-huye.org',
    username: 'choir-admin',
    password: 'choir123',
    group: 'choir',
  })
);
