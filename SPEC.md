# Synapse - Obsidian Plugin Specification

## Overview

A vocabulary learning plugin for Obsidian that combines **spaced repetition** (FSRS algorithm) with **interactive matching games** (Duolingo-style) to help users learn words across multiple languages.

---

## 1. Vocabulary File Format

### 1.1 File Location

- Configured in plugin settings (single file path, e.g., `Vocabulary/words.md`)
- One central file for all vocabulary entries

### 1.2 Entry Format

Inspired by the [Spaced Repetition plugin](https://github.com/st3v3nmw/obsidian-spaced-repetition) card syntax using `::` delimiters.

#### Basic Structure

```
definition (lang:XX) :: translation1 (lang:YY) :: translation2 (lang:ZZ) || metadata
```

#### Delimiters

| Delimiter | Purpose |
|-----------|---------|
| ` :: ` | Separates language variants (bidirectional) |
| ` || ` | Separates word definitions from metadata (tags, examples, notes) |
| ` ; ` | Separates multiple meanings within the same language |

#### Language Tag

- Each word/phrase must have explicit language code: `(lang:XX)`
- Uses ISO 639-1 codes: `en`, `de`, `ru`, `fr`, `es`, etc.

### 1.3 Examples

#### Simple entry (3 languages)

```markdown
мама (lang:ru) :: die Mutter (lang:de) :: mother (lang:en) || #family #A1
```

#### Multiple meanings

```markdown
laufen (lang:de) :: бежать ; ходить (lang:ru) :: to run ; to walk (lang:en) || #verb #A1 #irregular
```

#### Entry with examples

```markdown
gehen (lang:de) :: идти (lang:ru) :: to go (lang:en) || #verb #A1
   example: Ich gehe nach Hause. (lang:de) :: Я иду домой. (lang:ru) :: I'm going home. (lang:en)
   example: Er ist nach Berlin gegangen. (lang:de) :: Он поехал в Берлин. (lang:ru) :: He went to Berlin. (lang:en)
   note (lang:en): Irregular verb. Perfekt: ist gegangen
   note (lang:ru): Неправильный глагол. Perfekt: ist gegangen
```

#### Entry with word forms

```markdown
sein (lang:de) :: быть (lang:ru) :: to be (lang:en) || #verb #A1 #irregular
   forms (lang:de): ich bin, du bist, er ist, wir sind, ihr seid, sie sind
   note (lang:en): Most irregular verb in German
   note (lang:ru): Самый неправильный глагол в немецком
```

#### Entry with pronunciation

```markdown
chat (lang:fr) :: кошка (lang:ru) :: cat (lang:en) || #animal #A1
   pronunciation (lang:fr): [ʃa]
```

### 1.4 Metadata Fields (after `||`)

| Field | Format | Description |
|-------|--------|-------------|
| Tags | `#tag1 #tag2` | For filtering (difficulty, topic, CEFR level, etc.) |
| Examples | `example: ...` | Word in context, one per line, with language tags for each segment |
| Forms | `forms (lang:XX): ...` | Alternative forms, conjugations, declensions (language-specific) |
| Notes | `note (lang:XX): ...` | Any additional info (irregularity, usage tips). Multiple notes per entry allowed in different languages. |
| Pronunciation | `pronunciation (lang:XX): ...` | IPA or phonetic transcription (language-specific) |

### 1.5 Metadata Language Display Logic

When reviewing or playing a matching game, the plugin determines which metadata to display:

1. User selects learning direction (e.g., DE → RU)
2. Plugin looks for metadata matching the target language: `note (lang:ru)`, `forms (lang:ru)`
3. If found, displays that metadata
4. If not found, falls back to the first available language or shows nothing

This allows the same vocabulary entry to have rich context in multiple languages without cluttering the UI. Only the relevant language is shown based on the current learning direction.

### 1.6 Spaced Repetition Data (inline)

FSRS scheduling data is appended to each entry as a comment or inline property, keeping everything in the vocabulary file:

```markdown
мама (lang:ru) :: die Mutter (lang:de) :: mother (lang:en) || #family #A1 <!-- FSRS:{"scheduling":{...}} -->
```

Or using Obsidian properties (YAML-like inline):

```markdown
мама (lang:ru) :: die Mutter (lang:de) :: mother (lang:en) || #family #A1 [fsrs:2026-04-10|3.2|2.5|7|5|1]
```

FSRS inline format: `[fsrs:<nextReview>|<stability>|<difficulty>|<elapsedDays>|<repetitions>|<lapses>]`

---

## 2. Plugin Architecture

### 2.1 Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Vocabulary File | File picker | (required) | Path to the vocabulary markdown file |
| Primary Language | Text input | `en` | Default source language for UI |
| Daily Review Limit | Number | `20` | Max new cards per day |
| FSRS Parameters | JSON/object | (defaults) | Custom FSRS algorithm parameters |
| Matching Game Size | Number | `10` | Number of pairs per game round |
| Tags to Exclude | Text (comma-sep) | | Tags to skip during practice |

### 2.2 Main Menu (Plugin Home)

When user clicks the plugin ribbon icon or runs the command, they see:

```
┌─────────────────────────────────┐
│     VocabMaster                 │
├─────────────────────────────────┤
│                                 │
│  📅 Review Due (15 words)       │
│     Continue today's practice   │
│                                 │
│  🎯 Practice by Tags            │
│     Select tags to study        │
│                                 │
│  🃏 Spaced Repetition           │
│     Flashcard review mode       │
│                                 │
│  🎮 Find a Pair                 │
│     Matching game mode          │
│                                 │
│  📊 Statistics                  │
│     View progress               │
│                                 │
│  ⚙️ Settings                    │
│                                 │
└─────────────────────────────────┘
```

### 2.3 Modes

#### 2.3.1 Review Due (Daily Practice)

- Shows words that are due for review based on FSRS schedule
- Uses standard flashcard UI: shows one side, user reveals answer, rates recall
- Rating buttons: **Again**, **Hard**, **Good**, **Easy**
- FSRS algorithm calculates next review date based on rating
- Progress indicator: `7/15 reviewed`

#### 2.3.2 Practice by Tags

- User selects one or more tags from vocabulary file
- Configurable number of words to practice (default: 20)
- Same flashcard review UI as daily practice
- Useful for focused study (e.g., `#A1`, `#verbs`, `#family`)

#### 2.3.3 Spaced Repetition (Flashcard Mode)

- Full flashcard experience
- Card shows: source language word/phrase
- User clicks/taps to reveal: all translations + examples + notes
- Self-rating triggers FSRS scheduling update
- Supports bidirectional review (configurable direction)

**Flashcard UI:**

```
┌─────────────────────────────────┐
│                                 │
│      laufen                     │
│      (lang:de)                  │
│                                 │
│   [ Tap to reveal ]             │
│                                 │
└─────────────────────────────────┘

        ↓ (after reveal)

┌─────────────────────────────────┐
│                                 │
│      laufen                     │
│                                 │
│  ───────────────────────────    │
│  ru: бежать ; ходить            │
│  en: to run ; to walk           │
│                                 │
│  Examples:                      │
│  • Ich laufe schnell.           │
│                                 │
│  Note: Irregular verb           │
│                                 │
│  [Again] [Hard] [Good] [Easy]  │
│  1m     6m    10m   4d          │
│                                 │
└─────────────────────────────────┘
```

#### 2.3.4 Find a Pair (Matching Game)

- Two-column layout
- Left column: words in the **source** language
- Right column: translations in the **target** language (shuffled)
- User matches source → target pairs by clicking/selecting
- Timer and score tracking
- Incorrect matches highlighted, correct matches removed
- Game ends when all pairs matched

**Game UI:**

```
┌──────────────────────────────────────────────┐
│  Find a Pair          Score: 8/10  ⏱ 0:45   │
├────────────────────┬─────────────────────────┤
│  Deutsch           │  Русский                │
├────────────────────┼─────────────────────────┤
│  □ der Hund        │  □ кошка                │
│  □ laufen          │  □ бежать               │
│  □ die Mutter      │  □ собака               │
│  □ die Katze       │  □ мама                 │
│  □ gehen           │  □ идти                 │
└────────────────────┴─────────────────────────┘
```

**Game Settings:**
- Source language (left column)
- Target language (right column)
- Number of pairs (5, 10, 15, 20)
- Tag filter (optional)
- Difficulty: include only known words, unknown, or mixed

#### 2.4 Statistics

- Total words in vocabulary
- Words learned / learning / new
- Review streak
- Accuracy per tag
- Accuracy per language pair
- Time spent studying
- FSRS retention rate

---

## 3. FSRS Integration

### 3.1 Algorithm

Use the [FSRS (Free Spaced Repetition Scheduler)](https://github.com/open-spaced-repetition/fsrs-algorithm) algorithm.

### 3.2 Data Stored Per Entry

```json
{
  "scheduling": {
    "stability": 3.2,
    "difficulty": 2.5,
    "lastReview": "2026-04-03",
    "nextReview": "2026-04-10",
    "elapsedDays": 7,
    "repetitions": 5,
    "lapses": 1
  }
}
```

### 3.3 Storage Format

Inline in the vocabulary file, appended after metadata:

```
word (lang:XX) :: translation (lang:YY) || #tags [fsrs:2026-04-10|3.2|2.5|7|5|1]
```

Format: `[fsrs:<nextReview>|<stability>|<difficulty>|<elapsedDays>|<repetitions>|<lapses>]`

### 3.4 Rating Mapping

| Button | FSRS Rating | Effect |
|--------|-------------|--------|
| Again | 1 | Reset stability, shorter interval |
| Hard | 2 | Slightly increase interval |
| Good | 3 | Normal FSRS progression |
| Easy | 4 | Larger interval jump |

---

## 4. Parsing Logic

### 4.1 Word Entry Parser

```typescript
interface VocabularyEntry {
  // Core translations
  translations: {
    lang: string;
    meanings: string[];  // split by ` ; `
  }[];

  // Metadata
  tags: string[];
  examples: {
    segments: {
      lang: string;
      text: string;
    }[];
  }[];
  forms: {
    lang: string;
    text: string;
  }[];
  notes: {
    lang: string;
    text: string;
  }[];
  pronunciation: {
    lang: string;
    text: string;
  }[];

  // Scheduling
  fsrs?: FSRSData;

  // Raw
  rawLine: string;
  lineIndex: number;
}
```

### 4.2 Parse Flow

1. Read vocabulary file
2. Split by lines
3. For each line:
   - Extract main definition (before `||`)
   - Split by ` :: ` to get language variants
   - Parse `(lang:XX)` from each variant
   - Split meanings by ` ; `
   - Extract metadata (after `||`)
   - Parse tags (`#...`)
   - Parse sub-lines (`example:`, `forms:`, `note:`, `pronunciation:`)
   - Parse FSRS data if present (`[fsrs:...]`)
4. Return structured entries

### 4.3 Bidirectional Support

The `::` delimiter is bidirectional. Any language can be source or target:

- Review DE → RU: show `laufen (lang:de)`, expect `бежать (lang:ru)`
- Review RU → DE: show `бежать (lang:ru)`, expect `laufen (lang:de)`
- Review EN → DE: show `to run (lang:en)`, expect `laufen (lang:de)`

---

## 5. File Structure

```
synapse/
├── manifest.json           # Obsidian plugin manifest
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts             # Plugin entry point
│   ├── settings.ts         # Settings tab & config
│   ├── types.ts            # TypeScript interfaces
│   │
│   ├── parser/
│   │   ├── vocabulary-parser.ts    # Parse vocabulary file
│   │   └── fsrs-parser.ts          # Parse/serialize FSRS data
│   │
│   ├── scheduler/
│   │   └── fsrs-scheduler.ts       # FSRS algorithm wrapper
│   │
│   ├── ui/
│   │   ├── menu-view.ts            # Main plugin menu (modal)
│   │   ├── flashcard-view.ts       # Spaced repetition UI
│   │   ├── matching-game.ts        # Find a pair game
│   │   ├── tag-selector.ts         # Tag selection UI
│   │   └── statistics-view.ts      # Stats dashboard
│   │
│   ├── storage/
│   │   └── vocabulary-store.ts     # Read/write vocabulary file
│   │
│   └── utils/
│       ├── languages.ts            # Language code utilities
│       └── helpers.ts              # General utilities
│
└── styles.css              # Plugin styles
```

---

## 6. User Flows

### 6.1 First Time Setup

1. Install plugin
2. Open settings → select/create vocabulary file
3. Set primary language
4. Start adding words to vocabulary file
5. Click plugin icon → see main menu

### 6.2 Daily Review

1. Click plugin icon
2. See "Review Due (15 words)"
3. Click → flashcard mode starts
4. Review each card, rate recall
5. FSRS updates scheduling data in vocabulary file
6. Completion summary shown

### 6.3 Add New Words

1. Open vocabulary file directly in Obsidian
2. Add new entries using the format
3. New words appear in practice automatically (no scheduling data = new)

### 6.4 Matching Game

1. Click plugin icon
2. Select "Find a Pair"
3. Choose source/target languages
4. Choose tag filter (optional)
5. Choose number of pairs
6. Play game
7. See results (score, time, mistakes)
8. Optionally mark missed words for review

---

## 7. Future Extensibility

The plugin is designed to support additional modes:

- **Listening Mode**: Audio pronunciation → type the word
- **Typing Mode**: See definition → type translation
- **Writing Mode**: See word → write example sentence
- **Image Mode**: Match words with images
- **Conversation Mode**: Practice phrases in context

Each mode is a separate UI component that consumes the same `VocabularyEntry[]` data source.

---

## 8. Technical Requirements

- **Obsidian API**: Compatible with Obsidian 1.0+
- **TypeScript**: Strict mode
- **FSRS Library**: `fsrs.js` or `ts-fsrs` npm package
- **No external dependencies** beyond what Obsidian provides + FSRS library
- **Mobile compatible**: All UI must work on mobile devices

---

## 9. Vocabulary File Example (Complete)

```markdown
# My Vocabulary

## Animals

мама (lang:ru) :: die Mutter (lang:de) :: mother (lang:en) || #family #A1
der Hund (lang:de) :: собака (lang:ru) :: dog (lang:en) || #animal #A1
die Katze (lang:de) :: кошка (lang:ru) :: cat (lang:en) || #animal #A1

## Verbs

laufen (lang:de) :: бежать ; ходить (lang:ru) :: to run ; to walk (lang:en) || #verb #A1 #irregular
   example: Ich laufe jeden Morgen. (lang:de) :: Я бегаю каждое утро. (lang:ru)
   forms (lang:de): ich laufe, du läufst, er läuft, wir laufen, ihr lauft, sie laufen
   note (lang:en): Stem change: a → äu in 2nd/3rd person singular
   note (lang:ru): Изменение корня: a → äu во 2/3 лице ед.ч.

gehen (lang:de) :: идти (lang:ru) :: to go (lang:en) || #verb #A1
   example: Ich gehe nach Hause. (lang:de) :: Я иду домой. (lang:ru)
   note (lang:en): Perfekt: ist gegangen
   note (lang:ru): Perfekt: ist gegangen

sein (lang:de) :: быть (lang:ru) :: to be (lang:en) || #verb #A1 #irregular
   forms (lang:de): ich bin, du bist, er ist, wir sind, ihr seid, sie sind
   note (lang:en): Most irregular verb in German
   note (lang:ru): Самый неправильный глагол в немецком

## With Scheduling Data

chat (lang:fr) :: кошка (lang:ru) :: cat (lang:en) || #animal #A1 [fsrs:2026-04-10|3.2|2.5|7|5|1]
der Apfel (lang:de) :: яблоко (lang:ru) :: apple (lang:en) || #food #A1 [fsrs:2026-04-05|1.8|4.1|2|3|2]
```

---

## 10. Command Palette Commands

| Command | Description |
|---------|-------------|
| VocabMaster: Review Due Cards | Start daily review session |
| VocabMaster: Practice by Tags | Open tag selector for focused practice |
| VocabMaster: Start Matching Game | Launch find-a-pair game |
| VocabMaster: View Statistics | Open statistics dashboard |
| VocabMaster: Open Vocabulary File | Quick open the configured vocabulary file |

---

## 11. Ribbon Icon

- Click: Open main plugin menu
- Badge: Shows count of due words (optional)
