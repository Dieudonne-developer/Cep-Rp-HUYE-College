const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const User = require('./models/ProtocolUser');

withDatabase(() =>
  ensureAdmin(User, {
    email: 'protocol.admin@cep-huye.org',
    username: 'protocol-admin',
    password: 'protocol123',
    group: 'protocol',
  })
);
