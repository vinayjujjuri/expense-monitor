function parsePhonePeText(text) {
  const transactions = []

  // Split by Date headings (Jan 02, 2026 etc.)
  const blocks = text.split(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2},\s+\d{4}/g
  )

  for (const block of blocks) {
    const typeMatch = block.match(/\b(DEBIT|CREDIT)\b/)
    const amountMatch = block.match(/₹\s?([\d,]+(?:\.\d+)?)/)
    const partyMatch = block.match(
      /(Paid to|Received from)\s+([A-Za-z0-9 .&-]+)/i
    )
    const utrMatch = block.match(/UTR No\.\s*(\d+)/)
     const date =
      block.match(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2},\s+\d{4}/
      )?.[0] || null;

    if (!typeMatch || !amountMatch) continue

    transactions.push({
      date,
      type: typeMatch[1].toLowerCase(),
      amount: Number(amountMatch[1].replace(/,/g, "")),
      counterparty: partyMatch ? partyMatch[2].trim() : null,
      utr: utrMatch ? utrMatch[1] : null,
      rawText: block.trim(),
    })
  }

  return transactions
}

module.exports = { parsePhonePeText }
