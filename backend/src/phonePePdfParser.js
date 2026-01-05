/**
 * Extract PhonePe transactions from text
 */
function parsePhonePeText(text) {
  const transactions = [];

  const blockRegex =
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2},\s+\d{4}[\s\S]*?(?=(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2},|\Z)/g;

  let match;

  while ((match = blockRegex.exec(text)) !== null) {
    const block = match[0];

    const date =
      block.match(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2},\s+\d{4}/
      )?.[0] || null;

    const type = block.match(/\b(DEBIT|CREDIT)\b/)?.[1] || null;

    const amount =
      block.match(/₹\s?([\d,.]+)/)?.[1]?.replace(/,/g, "") || null;

    const merchant =
      block.match(/(Paid to|Received from)\s(.+?)(Transaction ID|UTR|$)/)?.[2]
        ?.trim() || null;

    const utr = block.match(/UTR No\.\s(\d+)/)?.[1] || null;

    transactions.push({
      date,
      type,
      amount: amount ? Number(amount) : null,
      merchant,
      utr,
    });
  }

  return transactions;
}

/**
 * Extract rows from tables (if present)
 */
function parseTables(tableResult) {
  const rows = [];

  for (const page of tableResult.pages || []) {
    for (const table of page.tables || []) {
      for (const row of table) {
        rows.push(row);
      }
    }
  }

  return rows;
}

module.exports = {
  parsePhonePeText,
  parseTables,
};
