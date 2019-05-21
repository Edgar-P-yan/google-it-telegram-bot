const resultsPerPage = 10;

const google = require('google');
google.resultsPerPage = resultsPerPage;

const googlePromised = require('es6-promisify').promisify(google);

module.exports = async function googleSearch(query, offset) {
  const result = await googlePromised(query, offset);
  const links = result.links.filter(link => link.title && link.href);
  return links;
};

module.exports.resultsPerPage = resultsPerPage;
