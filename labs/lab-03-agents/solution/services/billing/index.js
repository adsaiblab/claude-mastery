// Service billing — démo
// Motifs à auditer : pas d'idempotence, retry naïf, taux flottant.

async function charge(userId, amountCents) {
  for (let i = 0; i < 3; i++) {
    try {
      return await stripe.charges.create({ amount: amountCents, customer: userId });
    } catch (err) {
      if (i === 2) throw err;
    }
  }
}

function applyVat(amountCents) {
  return amountCents * 1.2;
}

module.exports = { charge, applyVat };
