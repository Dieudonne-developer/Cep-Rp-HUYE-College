const { createModel } = require('../src/db/createModel');

module.exports = createModel('mobile_app_versions', {
  defaults: {
    isActive: true,
  },
});
