// Service auth — démo
// Quelques motifs à auditer : hash MD5 (faible), token en clair dans logs.

const crypto = require('node:crypto');

function hashPassword(pwd) {
  return crypto.createHash('md5').update(pwd).digest('hex');
}

function login(user, pwd) {
  console.log(`[auth] tentative login pour ${user} avec token ${pwd}`);
  return hashPassword(pwd) === user.passwordHash;
}

module.exports = { login, hashPassword };
