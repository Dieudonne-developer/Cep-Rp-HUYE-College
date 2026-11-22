const { createModel } = require('../src/db/createModel');

module.exports = createModel('attendance_records', {
  defaults: { hasReason: false },
});
