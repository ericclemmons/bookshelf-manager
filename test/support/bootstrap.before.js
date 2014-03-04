module.exports = function(promise) {
  if (!promise) {
    throw new Error(typeof promise + ' is not a promise');
  }

  before(function(done) {
    promise().then(done.bind(this, null), done);
  });
}
