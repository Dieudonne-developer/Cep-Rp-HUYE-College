const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');

const groups = [
  ['choir', require('./models/UserRegistration')],
  ['cepier', require('./models/CepierUser')],
  ['anointed', require('./models/AnointedUser')],
  ['abanyamugisha', require('./models/AbanyamugishaUser')],
  ['psalm23', require('./models/Psalm23User')],
  ['psalm46', require('./models/Psalm46User')],
  ['protocol', require('./models/ProtocolUser')],
  ['social', require('./models/SocialUser')],
  ['evangelical', require('./models/EvangelicalUser')],
];

withDatabase(async () => {
  for (const [group, Model] of groups) {
    await ensureAdmin(Model, {
      email: `${group}.admin@cep.com`,
      username: `${group}-admin`,
      password: 'admin123',
      group,
    });
  }
});
