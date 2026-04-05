import type { VocabularyEntry, Translation, Example, ExampleSegment, Forms, Note, Pronunciation } from '../types';
import { parseFSRS } from './fsrs-parser';

const LANG_TAG_PATTERN = /\(lang:([a-z]{2})\)/i;
const MEANINGS_DELIMITER = ' ; ';
const TRANSLATION_DELIMITER = ' :: ';
const METADATA_DELIMITER = ' || ';
const EXAMPLE_PREFIX = 'example:';
const FORMS_PREFIX = 'forms';
const NOTE_PREFIX = 'note';
const PRONUNCIATION_PREFIX = 'pronunciation';
const INDENTED_LINE_PATTERN = /^\s{3,}/;

export function parseVocabularyFile(content: string): VocabularyEntry[] {
  const lines = content.split('\n');
  const entries: VocabularyEntry[] = [];
  let currentEntry: VocabularyEntry | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      if (currentEntry) {
        entries.push(currentEntry);
        currentEntry = null;
      }
      continue;
    }

    if (INDENTED_LINE_PATTERN.test(line) && currentEntry) {
      parseIndentedLine(currentEntry, trimmedLine);
      continue;
    }

    if (currentEntry) {
      entries.push(currentEntry);
    }
    currentEntry = parseMainLine(trimmedLine, i);
  }

  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries.filter((entry) => entry.translations.length > 0);
}

function parseMainLine(line: string, lineIndex: number): VocabularyEntry {
  const metadataIndex = line.indexOf(METADATA_DELIMITER);
  let mainPart = line;
  let metadataPart = '';

  if (metadataIndex !== -1) {
    mainPart = line.substring(0, metadataIndex).trim();
    metadataPart = line.substring(metadataIndex + METADATA_DELIMITER.length).trim();
  }

  const translations = parseTranslations(mainPart);
  const { tags, examples, forms, notes, pronunciations } = parseMetadata(metadataPart);
  const fsrs = parseFSRS(line);

  return {
    translations,
    tags,
    examples,
    forms,
    notes,
    pronunciations,
    fsrs,
    rawLine: line,
    lineIndex,
  };
}

function parseTranslations(mainPart: string): Translation[] {
  const variants = mainPart.split(TRANSLATION_DELIMITER);
  return variants.map((variant) => {
    const langMatch = variant.match(LANG_TAG_PATTERN);
    const lang = langMatch ? langMatch[1].toLowerCase() : 'unknown';
    const text = variant.replace(LANG_TAG_PATTERN, '').trim();
    const meanings = text.split(MEANINGS_DELIMITER).map((m) => m.trim());

    return { lang, meanings };
  });
}

function parseMetadata(metadata: string): {
  tags: string[];
  examples: Example[];
  forms: Forms[];
  notes: Note[];
  pronunciations: Pronunciation[];
} {
  const tags: string[] = [];
  const examples: Example[] = [];
  const forms: Forms[] = [];
  const notes: Note[] = [];
  const pronunciations: Pronunciation[] = [];

  const tokens = metadata.split(/\s+(?=#|$)/);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#')) {
      const tagMatches = trimmed.match(/#([^\s#]+)/g);
      if (tagMatches) {
        tags.push(...tagMatches.map((t) => t.substring(1)));
      }
    } else if (trimmed.startsWith(EXAMPLE_PREFIX)) {
      const exampleText = trimmed.substring(EXAMPLE_PREFIX.length).trim();
      const segments = parseExampleSegments(exampleText);
      if (segments.length > 0) {
        examples.push({ segments });
      }
    } else if (trimmed.startsWith(FORMS_PREFIX)) {
      const formsData = parseLanguageField(trimmed, FORMS_PREFIX);
      if (formsData) {
        forms.push(formsData);
      }
    } else if (trimmed.startsWith(NOTE_PREFIX)) {
      const noteData = parseLanguageField(trimmed, NOTE_PREFIX);
      if (noteData) {
        notes.push({ lang: noteData.lang, text: noteData.text });
      }
    } else if (trimmed.startsWith(PRONUNCIATION_PREFIX)) {
      const pronData = parseLanguageField(trimmed, PRONUNCIATION_PREFIX);
      if (pronData) {
        pronunciations.push({ lang: pronData.lang, text: pronData.text });
      }
    }
  }

  return { tags, examples, forms, notes, pronunciations };
}

function parseExampleSegments(text: string): ExampleSegment[] {
  const segments: ExampleSegment[] = [];
  const parts = text.split(TRANSLATION_DELIMITER);

  for (const part of parts) {
    const langMatch = part.match(LANG_TAG_PATTERN);
    if (langMatch) {
      const lang = langMatch[1].toLowerCase();
      const textContent = part.replace(LANG_TAG_PATTERN, '').trim();
      segments.push({ lang, text: textContent });
    }
  }

  return segments;
}

function parseLanguageField(
  token: string,
  prefix: string,
): { lang: string; text: string } | null {
  const pattern = new RegExp(`^${prefix}\\s*(\\(lang:[a-z]{2}\\)):\\s*(.+)$`, 'i');
  const match = token.match(pattern);

  if (match) {
    const langTag = match[1];
    const lang = langTag.replace(/\(lang:|\)/gi, '').toLowerCase();
    const text = match[2].trim();
    return { lang, text };
  }

  return null;
}

function parseIndentedLine(entry: VocabularyEntry, line: string): void {
  const trimmed = line.trim();

  if (trimmed.startsWith(EXAMPLE_PREFIX)) {
    const exampleText = trimmed.substring(EXAMPLE_PREFIX.length).trim();
    const segments = parseExampleSegments(exampleText);
    if (segments.length > 0) {
      entry.examples.push({ segments });
    }
  } else if (trimmed.startsWith(FORMS_PREFIX)) {
    const formsData = parseLanguageField(trimmed, FORMS_PREFIX);
    if (formsData) {
      entry.forms.push({ lang: formsData.lang, text: formsData.text });
    }
  } else if (trimmed.startsWith(NOTE_PREFIX)) {
    const noteData = parseLanguageField(trimmed, NOTE_PREFIX);
    if (noteData) {
      entry.notes.push({ lang: noteData.lang, text: noteData.text });
    }
  } else if (trimmed.startsWith(PRONUNCIATION_PREFIX)) {
    const pronData = parseLanguageField(trimmed, PRONUNCIATION_PREFIX);
    if (pronData) {
      entry.pronunciations.push({ lang: pronData.lang, text: pronData.text });
    }
  }
}

export function getTranslationByLang(
  entry: VocabularyEntry,
  lang: string,
): Translation | undefined {
  return entry.translations.find((t) => t.lang === lang);
}

export function getAllTranslationsByLang(
  entry: VocabularyEntry,
  lang: string,
): string[] {
  const translation = getTranslationByLang(entry, lang);
  return translation ? translation.meanings : [];
}

export function getAllLanguages(entry: VocabularyEntry): string[] {
  return entry.translations.map((t) => t.lang);
}

export function entryToMarkdown(entry: VocabularyEntry): string {
  const translationsStr = entry.translations
    .map((t) => {
      const meaningsStr = t.meanings.join(MEANINGS_DELIMITER);
      return `${meaningsStr} (lang:${t.lang})`;
    })
    .join(TRANSLATION_DELIMITER);

  let metadata = entry.tags.map((t) => `#${t}`).join(' ');

  for (const example of entry.examples) {
    const segmentsStr = example.segments
      .map((s) => `${s.text} (lang:${s.lang})`)
      .join(TRANSLATION_DELIMITER);
    metadata += `\n   ${EXAMPLE_PREFIX} ${segmentsStr}`;
  }

  for (const forms of entry.forms) {
    metadata += `\n   ${FORMS_PREFIX} (lang:${forms.lang}): ${forms.text}`;
  }

  for (const note of entry.notes) {
    metadata += `\n   ${NOTE_PREFIX} (lang:${note.lang}): ${note.text}`;
  }

  for (const pron of entry.pronunciations) {
    metadata += `\n   ${PRONUNCIATION_PREFIX} (lang:${pron.lang}): ${pron.text}`;
  }

  if (metadata) {
    return `${translationsStr} ${METADATA_DELIMITER} ${metadata}`;
  }

  return translationsStr;
}
