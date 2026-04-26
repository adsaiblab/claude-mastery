// Service notif — démo
// Motifs à auditer : envoi en série bloquant, pas de retry, secret en dur.

const SLACK_TOKEN = 'xoxb-fake-1234567890-leak';

async function notifyUsers(userIds, message) {
  const results = [];
  for (const id of userIds) {
    const r = await fetch('https://slack.example/api/chat.post', {
      method: 'POST',
      headers: { authorization: `Bearer ${SLACK_TOKEN}` },
      body: JSON.stringify({ channel: id, text: message }),
    });
    results.push(r.status);
  }
  return results;
}

module.exports = { notifyUsers };
