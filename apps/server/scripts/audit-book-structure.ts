import * as fs from 'fs';
import * as path from 'path';

enum ChunkType {
  NARRATIVE = 'NARRATIVE',
  INDEX = 'INDEX',
  TOC = 'TOC',
  REFERENCES = 'REFERENCES',
}

function detectChunkType(content: string): ChunkType {
  const lines = content.split('\n').map((l) => l.trim());
  const firstLines = lines.slice(0, 5).join(' ').toLowerCase();

  if (
    firstLines.includes('contents') ||
    firstLines.includes('contenido') ||
    firstLines.includes('table of contents') ||
    /##\s+(índice|indice)(\s+de)?/i.test(firstLines)
  ) {
    return ChunkType.TOC;
  }

  if (
    firstLines.includes('index') ||
    firstLines.includes('índice alfabético') ||
    firstLines.includes('indice alfabetico') ||
    firstLines.includes('index of subjects')
  ) {
    return ChunkType.INDEX;
  }

  if (
    firstLines.includes('references') ||
    firstLines.includes('bibliography') ||
    firstLines.includes('bibliografía') ||
    firstLines.includes('bibliografia') ||
    firstLines.includes('literatura citada')
  ) {
    return ChunkType.REFERENCES;
  }

  const textOnly = content.replace(/[#*|]/g, '');
  const words = textOnly.toLowerCase().match(/\b\w+\b/g) || [];

  const anatomyKeywords = [
    'action:',
    'origin:',
    'insertion:',
    'nerve:',
    'innervation:',
    'reflex:',
    'testing:',
  ];
  let anatomyScore = 0;
  for (const kw of anatomyKeywords) {
    if (content.toLowerCase().includes(kw)) anatomyScore++;
  }
  if (anatomyScore >= 2) return ChunkType.NARRATIVE;

  if (words.length < 15 && !content.includes('|')) return ChunkType.NARRATIVE;

  const enStopwords = new Set([
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
  const esStopwords = new Set([
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

  let stopwordCount = 0;
  for (const w of words) {
    if (enStopwords.has(w) || esStopwords.has(w)) stopwordCount++;
  }
  const stopwordDensity = words.length > 0 ? stopwordCount / words.length : 0;

  const digitCount = content.replace(/\D/g, '').length;
  const digitDensity = digitCount / content.length;

  const pipeCount = (content.match(/\|/g) || []).length;
  const pipeDensity = pipeCount / content.length;

  const seeAlsoCount = (
    content.match(/see also|véase también|vid\.|cfr\./gi) || []
  ).length;

  const indexPattern = /\b[a-z]{3,},\s*\d+[a-z]?\b/gi;
  const indexMatches = (content.match(indexPattern) || []).length;
  const indexDensity = words.length > 0 ? indexMatches / words.length : 0;

  const isHighPipeDensity = pipeDensity > 0.02;
  const isNumberList = digitDensity > 0.08 && stopwordDensity < 0.2;
  const isNonNarrativeList = stopwordDensity < 0.15 && words.length > 20;
  const isSeeAlsoIndex = seeAlsoCount >= 1 && stopwordDensity < 0.25;
  const isIndexPattern = indexDensity > 0.1;

  if (
    isHighPipeDensity ||
    isNumberList ||
    isNonNarrativeList ||
    isSeeAlsoIndex ||
    isIndexPattern
  ) {
    return ChunkType.INDEX;
  }

  const referenceKeywords = [
    'pp.',
    'vol.',
    'ed.',
    'journal',
    'university',
    'press',
    'inc.',
    'wilkins',
    'saunders',
    'elsevier',
    'springer',
    'medicina',
    'clinical',
    'et al',
    'doi:',
  ];
  let refMatchCount = 0;
  for (const kw of referenceKeywords) {
    if (content.toLowerCase().includes(kw)) refMatchCount++;
  }

  const isReferenceStyle =
    stopwordDensity < 0.25 &&
    (refMatchCount >= 2 || /19\d{2}|20\d{2}/.test(content));

  if (isReferenceStyle) {
    return ChunkType.REFERENCES;
  }

  return ChunkType.NARRATIVE;
}

function auditBook(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const pages = content.split(/<!-- PAGE_NUMBER: (\d+) -->/);
  const report: any[] = [];

  for (let i = 1; i < pages.length; i += 2) {
    const pageNum = parseInt(pages[i]);
    const pageContent = pages[i + 1]?.trim() || '';
    if (!pageContent) continue;
    const type = detectChunkType(pageContent);
    report.push({
      pageNum,
      type,
      snippet: pageContent.substring(0, 150).replace(/\n/g, ' '),
    });
  }

  console.log(`\n📘 REFINED AUDIT REPORT: ${path.basename(filePath)}`);
  console.log('--------------------------------------------------');

  const testPages = [10, 53, 100, 109, 300, 402, 424, 428];
  console.log('--- REFINED PAGE CHECK ---');
  testPages.forEach((p) => {
    const r = report.find((item) => item.pageNum === p);
    if (r) {
      console.log(`Page ${p}: ${r.type} | ${r.snippet}...`);
    }
  });

  const counts = { NARRATIVE: 0, INDEX: 0, TOC: 0, REFERENCES: 0 };
  report.forEach((r) => counts[r.type]++);
  console.log('\nFinal Stats:', counts);
}

const bookPath = path.resolve(
  __dirname,
  '../data/library/temporal/The Physiotherapist’s Pocketbook Essential facts at your -- Karen Kenyon MRes.md',
);
auditBook(bookPath);
