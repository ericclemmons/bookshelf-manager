module.exports = function(promise) {
  if (!promise) {
    throw new Error(typeof promise + ' is not a promise');
  }

  beforeEach(function(done) {
    promise().then(done.bind(this, null), done);
  });
}
