const { createModel } = require('../src/db/createModel');

const USER_DEFAULTS = {
  role: 'viewer',
  isVerified: false,
  isApproved: false,
};

function createUserModel(group) {
  return createModel('app_users', {
    defaults: {
      ...USER_DEFAULTS,
      adminGroup: group,
      userGroup: group,
    },
    defaultFilter: { userGroup: group },
  });
}

function createSongModel(group, artistDefault) {
  return createModel('songs', {
    defaults: {
      group,
      artist: artistDefault,
      mediaType: 'audio',
      downloadable: false,
      category: group,
    },
    defaultFilter: { group },
  });
}

function createEventModel(group) {
  return createModel('events', {
    defaults: { group },
    defaultFilter: { group },
  });
}

function createIdeaModel(group) {
  return createModel('implemented_ideas', {
    defaults: { group, anonymous: false },
    defaultFilter: { group },
  });
}

const ChatMessage = createModel('chat_messages', {
  defaults: {
    message: '',
    type: 'user',
    status: 'sent',
    group: 'choir',
  },
  jsonFields: ['voiceNote', 'fileAttachment'],
});

const Asset = createModel('assets', {
  defaults: { mimeType: 'image/jpeg' },
});

const GlobalEvent = createModel('global_events', {
  defaults: { status: 'upcoming' },
});

const GlobalIdea = createModel('global_ideas', {
  defaults: { anonymous: false, status: 'pending' },
});

const GlobalSupport = createModel('global_support', {
  defaults: {
    bank: {
      bankName: 'Bank of Kigali',
      accountName: 'CEP Ishyanga Ryera Choir',
      accountNumber: '00040-06945783-07',
      swiftCode: 'BKIGRWRW',
    },
    mobileMoney: {
      mtn: '0788 123 456 (Alice Uwase)',
      airtel: '0732 987 654 (Eric Mugisha)',
    },
    onlineDonationNote: 'Paystack verification pending server integration.',
  },
  jsonFields: ['bank', 'mobileMoney'],
});

const GroupSupport = createModel('group_support', {
  defaults: {
    bank: { bankName: '', accountName: '', accountNumber: '', swiftCode: '' },
    mobileMoney: { mtn: '', airtel: '' },
    onlineDonationNote: 'Paystack verification pending server integration.',
  },
  jsonFields: ['bank', 'mobileMoney'],
});

module.exports = {
  createUserModel,
  createSongModel,
  createEventModel,
  createIdeaModel,
  ChatMessage,
  Asset,
  GlobalEvent,
  GlobalIdea,
  GlobalSupport,
  GroupSupport,
};
