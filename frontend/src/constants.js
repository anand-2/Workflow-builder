export const STEP_TYPES = [
  { value: 'clean_text', label: 'Clean Text', description: 'Remove extra whitespace and fix typos' },
  { value: 'summarize', label: 'Summarize', description: 'Condense text to main points' },
  { value: 'extract_key_points', label: 'Extract Key Points', description: 'Create bullet list of key points' },
  { value: 'tag_category', label: 'Tag Category', description: 'Categorize content automatically' },
  { value: 'sentiment_analysis', label: 'Sentiment Analysis', description: 'Detect positive/negative/neutral' },
  { value: 'translate_to_simple', label: 'Translate to Simple', description: 'Simplify language for easier reading' },
];

export const MAX_STEPS = 4;
export const INPUT_NODE_ID = 'input';
