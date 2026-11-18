const { withDatabase } = require('./src/db/script');
const { ensureAdmin } = require('./src/db/seedAdmin');

const families = [
  ['choir', require('./models/UserRegistration'), 'choir@cep.com', 'choiradmin', 'choir123'],
  ['anointed', require('./models/AnointedUser'), 'anointed@cep.com', 'anointedadmin', 'anointed123'],
  ['abanyamugisha', require('./models/AbanyamugishaUser'), 'abanyamugisha@cep.com', 'abanyamugishaadmin', 'abanyamugisha123'],
  ['psalm23', require('./models/Psalm23User'), 'psalm23@cep.com', 'psalm23admin', 'psalm23123'],
  ['psalm46', require('./models/Psalm46User'), 'psalm46@cep.com', 'psalm46admin', 'psalm46123'],
  ['protocol', require('./models/ProtocolUser'), 'protocol@cep.com', 'protocoladmin', 'protocol123'],
  ['social', require('./models/SocialUser'), 'social@cep.com', 'socialadmin', 'social123'],
  ['evangelical', require('./models/EvangelicalUser'), 'evangelical@cep.com', 'evangelicaladmin', 'evangelical123'],
];

withDatabase(async () => {
  for (const [group, Model, email, username, password] of families) {
    await ensureAdmin(Model, { email, username, password, group });
  }
});
