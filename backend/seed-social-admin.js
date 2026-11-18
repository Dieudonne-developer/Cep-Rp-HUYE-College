const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');
const User = require('./models/SocialUser');

withDatabase(() =>
  ensureAdmin(User, {
    email: 'social.admin@cep-huye.org',
    username: 'social-admin',
    password: 'social123',
    group: 'social',
  })
);
