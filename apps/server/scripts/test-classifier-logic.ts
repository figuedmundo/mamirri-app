const englishStopwords = new Set([
  'the',
  'and',
  'for',
  'with',
  'was',
  'were',
  'from',
  'that',
  'this',
  'these',
  'those',
  'but',
  'not',
  'are',
  'is',
  'of',
  'in',
  'on',
  'at',
  'by',
  'an',
  'as',
  'be',
  'to',
]);
const spanishStopwords = new Set([
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'y',
  'en',
  'de',
  'con',
  'para',
  'por',
  'que',
  'este',
  'esta',
  'estos',
  'estas',
  'pero',
  'no',
  'son',
  'es',
  'al',
  'del',
  'su',
  'o',
]);

function getStopwordCount(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  if (words.length === 0) return 0;
  let count = 0;
  for (const w of words) {
    if (englishStopwords.has(w) || spanishStopwords.has(w)) {
      count++;
    }
  }
  return count / words.length;
}

function getDigitDensity(text) {
  if (text.length === 0) return 0;
  const digits = text.replace(/\D/g, '').length;
  return digits / text.length;
}

function getPipeDensity(text) {
  if (text.length === 0) return 0;
  const pipes = (text.match(/\|/g) || []).length;
  return pipes / text.length;
}

function testClassifier(content) {
  const swDensity = getStopwordCount(content);
  const dDensity = getDigitDensity(content);
  const pDensity = getPipeDensity(content);

  console.log(`- Stopword Density: ${swDensity.toFixed(3)}`);
  console.log(`- Digit Density: ${dDensity.toFixed(3)}`);
  console.log(`- Pipe Density: ${pDensity.toFixed(3)}`);

  if (pDensity > 0.02) return 'INDEX (Table detected)';
  if (dDensity > 0.1 && swDensity < 0.15) return 'INDEX (Number list detected)';
  if (swDensity < 0.1) return 'INDEX/REFERENCES (Low natural language)';

  return 'NARRATIVE';
}

const samples = [
  {
    name: 'Index Sample 1',
    content:
      '| Subtalar joint, close packed position and capsular pattern, 161t-162t Subthalamic nucleus, 182f Suction, airway, 254-255 Suffixes and prefixes, 378-382 Sulcus sign, 106 Sulfasalazine, 349',
  },
  {
    name: 'Bibliography Sample 1',
    content:
      '- Basmajian, J.V.: Muscles Alive, ed. 3, Baltimore, Williams & Wilkins, 1974. - Bateman, J.E.: Trauma to Nerves in Limbs, Philadelphia, Saunders, 1962. - Bauer, D.D.: Lumbar Discography and Low Ba...',
  },
  {
    name: 'Narrative Sample 1',
    content:
      'Patient describes an electric, painful sensation in the palm, thumb, index, middle, and half of the ring finger. If a patient has pain in the neck that radiates down through the arm into the hand, the diagnosis of cervical radiculopathy should be entertained.',
  },
];

samples.forEach((s) => {
  console.log(`Testing: ${s.name}`);
  console.log(`Result: ${testClassifier(s.content)}`);
  console.log('---');
});
