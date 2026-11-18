const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const AnointedUser = require('./models/AnointedUser');

withDatabase(() =>
  ensureAdmin(AnointedUser, {
    email: 'anointed.admin@cep-huye.org',
    username: 'anointed-admin',
    password: 'anointed123',
    group: 'anointed',
  })
);
