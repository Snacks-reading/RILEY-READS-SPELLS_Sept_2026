# Star Speller · Spell With Ry

Open `index.html` locally, or use the existing GitHub Pages project address. `index(1).html` loads the same app so the earlier bookmark still works. There are no frameworks, external assets, accounts, or network calls in the learning engine. Natural voice availability depends on the device; some browser voices need connectivity.

This is the spelling app. Learn With Ry, Rayna’s Audio, Ry’s Weekly Word, and Harper’s Weekly Word remain separate programs.

## Learning

The original 18-lesson Star Speller registry is preserved: A1, A1.5, and A2–A17. The new bank contains 432 contextual word items, including 288 held-out transfer items. Eight teaching words per lesson expand as previously tested transfer words become available for practice. Transfer words stay hidden until an attempt and are checked against the learner’s global exposure history.

Lessons follow Teach → Check → Retrieve → Practice → Apply → Transfer. Independent mastery checks and delayed retrieval are separate evidence stages. Practice includes rule checks, dictated spelling, recognition, select exactly 2, new written sentences, targeted correction, parallel words after a miss, and older-pattern review. Written sentences retain their exact prompts, prompt IDs, subjects, responses, timestamps, versions, and review statuses. Their meaning and sentence quality await ChatGPT review; the browser checks only target spelling.

## Prior evidence and placement

`prior-evidence.js` contains the exact recovered baseline and original instructional labels from `Spell-With-Ry_Governed-Rebuild.html`. The source file and current repository’s original `index(1).html` were identical when recovered. The immutable source is retained in the test fixture.

The parent view labels the baseline **Prior Diagnostic Evidence**, shows what Riley actually typed, and computes new instructional hypotheses separately. The earlier labels and baseline remain archived. Previously reported completion of A1–A6, including A1.5, is retained as completion; old “secure” judgments do not transfer.

A short adaptive placement check prioritizes concepts suggested by the prior misses. It can stop after three items when an instructional gap is clear, or examine up to five prioritized concepts in 10–12 items. Each concept pairs a prior target with an unexposed transfer word. Placement guides instruction and never awards mastery.

## Mastery evidence

- Four independent 10-word checks, each ≥90% on first attempts, at least 24 hours apart.
- Both unfamiliar transfer words correct in each check, with different transfer targets across the four checks.
- ≥90% on delayed checks at least 48 hours and 7 days after the fourth check. The delayed checks must also be at least 24 hours apart.
- A failed 48-hour check requires a fresh 48-hour interval; a failed 7-day check requires a fresh 7-day interval.
- Recognition, clues, coached corrections, placement, and completion cannot award mastery.
- Score records are verified against their underlying first attempts. Corrections and audio flags are append-only records.

The app can continue teaching while retention evidence is pending.

An unhinted dictated response is recorded as independent even during ordinary lesson retrieval. Only responses belonging to a qualifying independent mastery or retention session can satisfy the mastery gate. Immediate targeted reteaching and corrections remain supported practice. Opening the parent view during an independent check switches that session to supported practice, because prior answer spellings are visible there.

## Audio quality

Every dictated item plays the natural target word → meaningful sentence → target word, using one selected English voice at 0.92 or 0.86 speed. There is no music, sound effect, segmented independent pronunciation, or spoken interface text. Replay has no penalty or limit. The target stays visually hidden during independent attempts and feedback stays neutral until the check ends.

The voice must first pass a listener check on Riley’s device. Natural female voices are preferred when recognizable in the browser’s voice list; the app never silently substitutes a default voice. Playback must complete, and Riley must confirm she heard and understood the word. Missing/clipped playback or a reported audio issue cannot count as mastery evidence. A later audio flag also excludes an earlier attempt without editing the original response. Automatic event checks do not establish acoustic naturalness; the actual device/listener check remains necessary.

## Progress

The new storage key is `ry_star_speller_v3`. Existing `spell_with_ry_governed_v2` and `rrs_single_v1` data are recovered and archived, and their keys are left unchanged. A matching saved baseline on the device takes priority over the recovered snapshot. New attempts, corrections, checks, sentences, and placement records are retained.

Progress is local to the browser. Parent / Tutor provides JSON export and merge import for another device or backup. Import preserves existing records and archives conflicting versions. Audio approval must be completed on the destination device.

## Sources

- Original Star Speller lesson registry: `Pasted text.txt`, April 9, 2026.
- Prior baseline and instructional labels: `Spell-With-Ry_Governed-Rebuild.html` / original GitHub file, recovered October 5, 2026.
- [Tennessee ELA standards](https://www.tn.gov/content/dam/tn/stateboardofeducation/documents/standards/ela-standards-2024-25/2-8-19%20IV%20C%20English%20Language%20Arts%20Standards%20Attachment%20Clean%20Copy.pdf): 6.L.CSE.2, 6.L.VAU.4, and 6.L.VAU.6, checked October 5, 2026.
- [Louisa Moats, How Spelling Supports Reading](https://www.readingrockets.org/topics/early-literacy-development/articles/how-spelling-supports-reading).
- [Louisa Moats and Carol Tolman, Six Syllable Types](https://www.readingrockets.org/topics/spelling-and-word-study/articles/six-syllable-types).

The new word bank, lesson explanations, sentence contexts, memory cues, and test items are authored practice materials; they are not represented as classroom-assigned word lists. American spellings are used.

## Validation

Run `node tests/engine.test.cjs` for preservation, first-attempt integrity, audio sequence and replay semantics, hidden targets, mastery gates, spaced retention, adaptive placement, and import conflicts. Speech in the regression suite is simulated. It does not substitute for hearing the selected voice on Riley’s device.
