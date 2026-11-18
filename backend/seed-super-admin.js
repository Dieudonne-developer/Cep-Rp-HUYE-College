const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const CepierUser = require('./models/CepierUser');

withDatabase(() =>
  ensureAdmin(CepierUser, {
    email: 'superadmin@cep.com',
    username: 'superadmin',
    password: 'SuperAdmin@2024',
    role: 'super-admin',
    group: 'cepier',
  })
);
