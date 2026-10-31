// ─── "Where your 100 leads go" — the section above the proof strip ─────
// Each stage starts from what's left after the one before it.

export const leadLeak = {
  eyebrow: 'The lead leak',
  stat: '99%',
  who: 'realtors', // "99% of realtors" — shown as the highlighted stat
  title: 'struggle with these',
  highlight: 'lead-related problems.', // marked in red after the title
  intro: "You're getting 100 leads.",
  introNext: "Here's where they go.",
  total: 100,
  stages: [
    { from: 100, lost: 30, icon: 'no-answer', short: 'No answer', text: "don't answer your calls." },
    { from: 70, lost: 20, icon: 'not-interested', short: 'Not interested', text: "say they're not interested." },
    { from: 50, lost: 20, icon: 'price', short: 'Price / location', text: 'reject the offer due to price, location, or a mismatch with their requirements.' },
    { from: 30, lost: 20, icon: 'silent', short: 'Gone silent', text: 'go silent after receiving the details.' },
    { from: 10, lost: 5, icon: 'no-visit', short: 'No site visit', text: "don't visit the property despite multiple follow-ups." },
  ],
}
