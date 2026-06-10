const isMissingTable = (error) =>
  error?.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(error?.message || '');

module.exports = { isMissingTable };
