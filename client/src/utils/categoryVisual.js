// Maps a skill's category to a representative emoji, used as a banner
// placeholder on skill cards that don't have a real uploaded photo —
// keeps every card visually "complete" instead of leaving a bare gap.
const ICONS = {
  Teaching: '📚',
  Technical: '💻',
  Design: '🎨',
  Healthcare: '🏥'
};

export const getCategoryIcon = (category) => ICONS[category] || '🔧';
