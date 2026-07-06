# Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build phase 1 of the pipeline per the signed-off spec (plan/phase1_prompt_design.md): the OpenStax Calc 1 corpus in references/, the generator and critic prompts, a package validator, and the full test round with negative controls.

**Architecture:** Phase 1 is two agentic prompts run in sequence against a local corpus. The generator solves the source problem, searches references/, and writes the 5-file package; the critic (fresh session) re-solves the problem before reading any draft, then adversarially audits the mapping and fills the critique fields of lo_mapping.json. A PowerShell validator gives every test run a mechanical pass/fail gate.

**Tech Stack:** Markdown prompts, JSON, PowerShell 5.1 (validator), Read tool over the OpenStax PDF (corpus extraction), tools/tectonic.exe (end-to-end compile check).

## Global Constraints

- Spec of record: plan/phase1_prompt_design.md (signed off July 5, 2026). On any conflict, the spec wins; log deviations in CLAUDE.md.
- ASCII only in every generated artifact (corpus sections, extracts, JSON, prompts, problem files). The /phase1example files are exempt (Peter's, contain the section sign).
- No em dashes in any prose. Use commas, colons, or restructure.
- snake_case filenames; prompts are .md.
- Corpus content comes from references/calculus-textbook.pdf via Read page ranges, NEVER from model memory. Never cite a section whose file was not opened.
- Ground-truth hierarchy (spec sec 5): section files beat model memory; book_map.json beats section files for metadata; problem.txt alone defines tested skills; on critic/generator answer disagreement, halt.
- JSON: valid, no comments, no trailing commas. PowerShell: 5.1 syntax (no `&&`, no ternary); `ConvertTo-Json` always with `-Depth 10`.
- Commit after every task. Commit messages are SHORT ONE-LINERS (Hitaansh's preference). Do not push.
- Update CLAUDE.md in the same commit whenever a task completes a milestone or settles a decision.
- The five package filenames are fixed by phase 2's input contract: primary.md, supporting_01.md (02, ...), lo_mapping.json, verified_answer.txt; error runs produce phase1_error.txt instead.

---

### Task 1: Corpus scaffold: book_map.json from the PDF front matter and TOC

**Files:**
- Create: `references/openstax_calculus_v1/book_map.json`
- Read: `references/calculus-textbook.pdf` (title page, license page, table of contents)

**Interfaces:**
- Produces: `book_map.json` with the exact keys below. Tasks 2-7 fill `learning_objectives` and `topic_keywords` per section; the prompts (Tasks 9-10) and all test runs treat this file as the search index.

- [ ] **Step 1: Read the PDF front matter and TOC**

Use the Read tool on `references/calculus-textbook.pdf` with `pages: "1-10"` (extend the range if the TOC continues). Record: exact title, authors, the license as printed (expected CC BY-NC-SA 4.0, but transcribe what the license page actually says), the attribution wording OpenStax requires, and for every section of chapters 1 through 6: section number, section title, book page number. Also note the offset between book page numbers and PDF page numbers (find one known section and compare).

- [ ] **Step 2: Write book_map.json**

Structure (metadata values transcribed from the PDF, not from this plan; the two sections shown are format examples, include EVERY section of chapters 1-6):

```json
{
  "book_key": "openstax_calculus_v1",
  "book_tag": "openstax_calc1",
  "title": "Calculus Volume 1",
  "authors": ["<as printed>"],
  "license": "<as printed on the license page>",
  "license_url": "<as printed>",
  "attribution_required": "<the attribution line the license page requires>",
  "source_url": "https://openstax.org/books/calculus-volume-1",
  "course_level": "calculus_1",
  "pdf_page_offset": 0,
  "sections": [
    {
      "number": "1.1",
      "title": "<from TOC>",
      "book_page": 0,
      "file": "sections/1_1_<slug>.md",
      "learning_objectives": [],
      "topic_keywords": []
    },
    {
      "number": "1.2",
      "title": "<from TOC>",
      "book_page": 0,
      "file": "sections/1_2_<slug>.md",
      "learning_objectives": [],
      "topic_keywords": []
    }
  ]
}
```

`pdf_page_offset` = PDF page minus book page, so later tasks can jump straight to a section. `file` slugs: lowercase, snake_case, from the section title (e.g. `4_7_applied_optimization.md`). Skip chapter intros, chapter reviews, and end-of-chapter exercise pages; sections only.

- [ ] **Step 3: Validate JSON and check completeness**

Run: `powershell -Command "(Get-Content references/openstax_calculus_v1/book_map.json -Raw | ConvertFrom-Json).sections.Count"`
Expected: the count matches the number of numbered sections in the TOC for chapters 1-6 (typically about 45; verify against the TOC, do not trust the typical number).

- [ ] **Step 4: Commit**

```powershell
git add references/openstax_calculus_v1/book_map.json
git commit -m "Added OpenStax Calc 1 book map"
```

Note (spec sec 8 open item): corpus text files are committed locally; whether references/ ever gets PUSHED is Hitaansh's call under backlog 8 (the PDF is already on the remote, so local commits add no new exposure). Do not push.

---

### Task 2: Corpus sections, chapter 1

**Files:**
- Create: `references/openstax_calculus_v1/sections/1_*.md` (one file per chapter 1 section listed in book_map.json)
- Modify: `references/openstax_calculus_v1/book_map.json` (fill `learning_objectives` and `topic_keywords` for chapter 1 entries)

**Interfaces:**
- Consumes: book_map.json section list and `pdf_page_offset` from Task 1.
- Produces: corpus section files in the format below. The generator prompt (Task 9) reads these; extract content must therefore be complete enough to teach from.

- [ ] **Step 1: Extract each section from the PDF**

For each chapter 1 section in book_map.json: Read `references/calculus-textbook.pdf` at `pages: "<book_page + pdf_page_offset>-<next section's start page + pdf_page_offset - 1>"` (split into two Reads if over 20 pages). Then write the section file in this exact format:

```markdown
# OpenStax Calculus Volume 1, Section <n.m>: <Title>

## Learning Objectives
- <verbatim from the section's opening Learning Objectives box>

## Topic Keywords
- <5 to 10 lowercase keywords naming the section's concepts and techniques>

## Content

<condensed faithful restatement of the section: every key definition, theorem,
and rule stated in full; 2 to 3 representative worked examples WITH complete
solutions; the section's key formulas. ASCII and standard LaTeX only; no
figures, no checkpoint exercises, no chapter-review material.>
```

Target 60 to 150 lines per file. Content must come from the pages just read, never from memory.

- [ ] **Step 2: Fill book_map.json for chapter 1**

Copy each section's Learning Objectives (verbatim) and the chosen topic_keywords into its book_map.json entry.

- [ ] **Step 3: Validate**

Run: `powershell -Command "$m = Get-Content references/openstax_calculus_v1/book_map.json -Raw | ConvertFrom-Json; $m.sections | Where-Object { $_.number -like '1.*' } | ForEach-Object { if (-not (Test-Path (Join-Path 'references/openstax_calculus_v1' $_.file))) { Write-Output ('MISSING ' + $_.file) }; if ($_.learning_objectives.Count -eq 0) { Write-Output ('NO LOS ' + $_.number) } }"`
Expected: no output.

Also spot-check one file for non-ASCII: `powershell -Command "Get-ChildItem references/openstax_calculus_v1/sections/1_*.md | ForEach-Object { if ([regex]::IsMatch((Get-Content $_.FullName -Raw), '[^\x00-\x7F]')) { Write-Output ('NON-ASCII ' + $_.Name) } }"`
Expected: no output.

- [ ] **Step 4: Commit**

```powershell
git add references/openstax_calculus_v1
git commit -m "Added OpenStax Calc 1 chapter 1 corpus sections"
```

---

### Task 3: Corpus sections, chapter 2

Same four steps as Task 2 with `2_*.md` / `'2.*'` substituted throughout: extract each chapter 2 section from the PDF into `references/openstax_calculus_v1/sections/2_<m>_<slug>.md` using the exact file format shown in Task 2 Step 1 (header line, Learning Objectives verbatim, 5-10 topic keywords, condensed Content with full definitions/theorems and 2-3 worked examples, 60-150 lines, ASCII only, from the PDF pages just read); fill the chapter 2 book_map.json entries; run both validation commands from Task 2 Step 3 with the chapter filter changed to `2`; commit.

- [ ] Extract all chapter 2 sections into sections/ files
- [ ] Fill chapter 2 book_map.json learning_objectives and topic_keywords
- [ ] Run the file-exists/LO-filled and ASCII validation commands (no output expected)
- [ ] `git add references/openstax_calculus_v1; git commit -m "Added OpenStax Calc 1 chapter 2 corpus sections"`

---

### Task 4: Corpus sections, chapter 3

Same four steps as Task 2 with chapter filter `3`: extract each chapter 3 section into `sections/3_<m>_<slug>.md` in the Task 2 Step 1 format (header, verbatim LOs, keywords, condensed Content with full rule statements and 2-3 worked examples, 60-150 lines, ASCII, from the PDF); fill book_map entries; validate; commit.

- [ ] Extract all chapter 3 sections into sections/ files
- [ ] Fill chapter 3 book_map.json learning_objectives and topic_keywords
- [ ] Run the validation commands with filter `3.*` (no output expected)
- [ ] `git add references/openstax_calculus_v1; git commit -m "Added OpenStax Calc 1 chapter 3 corpus sections"`

---

### Task 5: Corpus sections, chapter 4

Same four steps, chapter filter `4`. Note: chapter 4 contains the sections the happy-path test (Task 11) most needs (maxima/minima, applied optimization), so worked examples here must be complete.

- [ ] Extract all chapter 4 sections into sections/ files (Task 2 Step 1 format)
- [ ] Fill chapter 4 book_map.json learning_objectives and topic_keywords
- [ ] Run the validation commands with filter `4.*` (no output expected)
- [ ] `git add references/openstax_calculus_v1; git commit -m "Added OpenStax Calc 1 chapter 4 corpus sections"`

---

### Task 6: Corpus sections, chapter 5

Same four steps, chapter filter `5`. Note: integration and the net change theorem live here; the happy-path test also leans on this chapter.

- [ ] Extract all chapter 5 sections into sections/ files (Task 2 Step 1 format)
- [ ] Fill chapter 5 book_map.json learning_objectives and topic_keywords
- [ ] Run the validation commands with filter `5.*` (no output expected)
- [ ] `git add references/openstax_calculus_v1; git commit -m "Added OpenStax Calc 1 chapter 5 corpus sections"`

---

### Task 7: Corpus sections, chapter 6

Same four steps, chapter filter `6`.

- [ ] Extract all chapter 6 sections into sections/ files (Task 2 Step 1 format)
- [ ] Fill chapter 6 book_map.json learning_objectives and topic_keywords
- [ ] Run the validation commands with filter `6.*` (no output expected)
- [ ] `git add references/openstax_calculus_v1; git commit -m "Added OpenStax Calc 1 chapter 6 corpus sections"`

---

### Task 8: Package validator with self-tests

**Files:**
- Create: `tools/check_phase1_package.ps1`

**Interfaces:**
- Consumes: a package directory (the 5 files) and `phase1example/lo_mapping.json` as the schema reference.
- Produces: `check_phase1_package.ps1 -PackagePath <dir> -Stage generator|critic [-AllowNonAscii]`, exit 0 = all checks pass, exit 2 = failures (prints a check table). Tasks 11-14 gate on this. Follows the recon validator skeleton: exit 0/2, explicit checks, no discovery magic.

- [ ] **Step 1: Establish the failing test (validator absent)**

Run: `powershell -File tools/check_phase1_package.ps1 -PackagePath phase1example -Stage critic -AllowNonAscii`
Expected: error, file does not exist.

- [ ] **Step 2: Write the validator**

```powershell
param(
    [Parameter(Mandatory=$true)][string]$PackagePath,
    [Parameter(Mandatory=$true)][ValidateSet("generator","critic")][string]$Stage,
    [string]$ExampleMapping = "phase1example\lo_mapping.json",
    [switch]$AllowNonAscii
)

$script:failed = $false
$results = New-Object System.Collections.ArrayList

function Check($name, $ok, $detail) {
    $status = "PASS"
    if (-not $ok) { $status = "FAIL"; $script:failed = $true }
    [void]$results.Add([pscustomobject]@{ check = $name; status = $status; detail = $detail })
}

$loPath = Join-Path $PackagePath "lo_mapping.json"
$vaPath = Join-Path $PackagePath "verified_answer.txt"
Check "lo_mapping.json exists" (Test-Path $loPath) $loPath
Check "verified_answer.txt exists" (Test-Path $vaPath) $vaPath
if (-not (Test-Path $loPath)) { $results | Format-Table -AutoSize; exit 2 }

$lo = $null
try { $lo = Get-Content $loPath -Raw -Encoding UTF8 | ConvertFrom-Json } catch {}
Check "lo_mapping.json parses" ($null -ne $lo) ""
if ($null -eq $lo) { $results | Format-Table -AutoSize; exit 2 }

$noPrimary = ($lo.no_primary_available -eq $true)
$primaryPath = Join-Path $PackagePath "primary.md"
Check "primary.md exists (or no_primary_available)" ((Test-Path $primaryPath) -or $noPrimary) ""

$supporting = @(Get-ChildItem -Path $PackagePath -Filter "supporting_*.md" -ErrorAction SilentlyContinue)
Check "supporting extract present (or no coverage)" (($supporting.Count -ge 1) -or $noPrimary) "$($supporting.Count) found"

$ex = Get-Content $ExampleMapping -Raw -Encoding UTF8 | ConvertFrom-Json
$exKeys = ($ex.PSObject.Properties.Name | Sort-Object) -join ","
$loKeys = ($lo.PSObject.Properties.Name | Sort-Object) -join ","
Check "top-level keys match example" ($exKeys -eq $loKeys) "got [$loKeys]"

$exSecKeys = ($ex.sections[0].PSObject.Properties.Name | Sort-Object) -join ","
$secOk = $true; $secDetail = ""
foreach ($s in @($lo.sections)) {
    $k = ($s.PSObject.Properties.Name | Sort-Object) -join ","
    if ($k -ne $exSecKeys) { $secOk = $false; $secDetail = "got [$k]" }
}
if (@($lo.sections).Count -eq 0) { $secOk = $noPrimary }
Check "section entry keys match example" $secOk $secDetail

$primaryCount = @($lo.sections | Where-Object { $_.role -eq "PRIMARY" }).Count
Check "exactly one PRIMARY (zero only if no_primary_available)" (($primaryCount -eq 1) -or ($noPrimary -and $primaryCount -eq 0)) "$primaryCount PRIMARY"
$supRoleCount = @($lo.sections | Where-Object { $_.role -eq "SUPPORTING" }).Count
Check "supporting files match SUPPORTING roles" ($supporting.Count -eq $supRoleCount) "files=$($supporting.Count) roles=$supRoleCount"

Check "books_searched non-empty" (@($lo.books_searched).Count -ge 1) ""

if ($Stage -eq "generator") {
    Check "critique_status pending" ($lo.critique_status -eq "pending") "$($lo.critique_status)"
    Check "critique_score null" ($null -eq $lo.critique_score) ""
    Check "critique_findings empty" (@($lo.critique_findings).Count -eq 0) ""
    Check "assessments blank" (($lo.primary_assessment -eq "") -and ($lo.supporting_assessment -eq "") -and ($lo.multipart_assessment -eq "")) ""
    Check "recommended_changes empty" (@($lo.recommended_changes).Count -eq 0) ""
    Check "search_reasonable null" ($null -eq $lo.search_reasonable) ""
} else {
    Check "critique_status completed" ($lo.critique_status -eq "completed") "$($lo.critique_status)"
    Check "critique_score is a number" (($lo.critique_score -is [int]) -or ($lo.critique_score -is [int64]) -or ($lo.critique_score -is [double]) -or ($lo.critique_score -is [decimal])) ""
    Check "at least one critique finding" (@($lo.critique_findings).Count -ge 1) ""
    Check "assessments filled" (($lo.primary_assessment -ne "") -and ($lo.supporting_assessment -ne "") -and ($lo.multipart_assessment -ne "")) ""
    Check "search_reasonable is boolean" ($lo.search_reasonable -is [bool]) ""
    if (($lo.mapping_confidence -eq "LOW") -or $noPrimary) {
        Check "missing_concepts non-empty on weak mapping" (@($lo.missing_concepts).Count -ge 1) ""
    }
}

$allAnchors = New-Object System.Collections.ArrayList
$extractFiles = @()
if (Test-Path $primaryPath) { $extractFiles += Get-Item $primaryPath }
$extractFiles += $supporting
foreach ($f in $extractFiles) {
    $text = Get-Content $f.FullName -Raw -Encoding UTF8
    $hasMeta = ($text -match '\*\*OER:\*\*') -and ($text -match '\*\*Source:\*\*') -and ($text -match '\*\*License:\*\*') -and ($text -match '\*\*Attribution required:\*\*')
    Check "$($f.Name) has metadata header" $hasMeta ""
    $anchors = [regex]::Matches($text, '\{#[A-Za-z0-9_.-]+\}') | ForEach-Object { $_.Value }
    Check "$($f.Name) has at least one anchor" (@($anchors).Count -ge 1) ""
    foreach ($a in $anchors) { [void]$allAnchors.Add($a) }
}
$dupes = @($allAnchors | Group-Object | Where-Object { $_.Count -gt 1 })
Check "anchors unique across package" ($dupes.Count -eq 0) (($dupes | ForEach-Object { $_.Name }) -join " ")

if (Test-Path $vaPath) {
    $va = Get-Content $vaPath -Raw -Encoding UTF8
    Check "verified_answer.txt non-empty" ($va.Trim().Length -gt 0) ""
}

if (-not $AllowNonAscii) {
    foreach ($f in @(Get-ChildItem -Path $PackagePath -File)) {
        $text = Get-Content $f.FullName -Raw -Encoding UTF8
        Check "$($f.Name) ASCII only" (-not [regex]::IsMatch($text, '[^\x00-\x7F]')) ""
    }
}

$results | Format-Table -AutoSize
if ($script:failed) { exit 2 } else { exit 0 }
```

- [ ] **Step 3: Positive self-test against Peter's example**

Run: `powershell -File tools/check_phase1_package.ps1 -PackagePath phase1example -Stage critic -AllowNonAscii`
Expected: all checks PASS, exit 0. (`-AllowNonAscii` because Peter's files contain the section sign; ours must not.)

- [ ] **Step 4: Negative self-test (a broken package must FAIL)**

```powershell
$scratch = "..\phase1_validator_negcheck"
Copy-Item phase1example $scratch -Recurse -Force
$j = Get-Content "$scratch\lo_mapping.json" -Raw | ConvertFrom-Json
$j.PSObject.Properties.Remove("missing_concepts")
$j | ConvertTo-Json -Depth 10 | Set-Content "$scratch\lo_mapping.json" -Encoding UTF8
powershell -File tools/check_phase1_package.ps1 -PackagePath $scratch -Stage critic -AllowNonAscii
```

Expected: "top-level keys match example" FAILS, exit 2. Then delete the scratch copy: `Remove-Item $scratch -Recurse -Force -Confirm:$false`. (Scratch lives OUTSIDE the repo so a failed cleanup cannot dirty the tree.)

- [ ] **Step 5: Commit**

```powershell
git add tools/check_phase1_package.ps1
git commit -m "Added phase 1 package validator"
```

Note: tools/ is gitignored for tectonic.exe; if `git add` reports the path ignored, add with `git add -f tools/check_phase1_package.ps1` (scripts should be tracked; only the binary stays ignored) and record the .gitignore nuance in CLAUDE.md if an exception rule is needed.

---

### Task 9: Generator prompt

**Files:**
- Create: `prompts/phase1_generator_prompt_v1.md`
- Read first: `plan/phase1_prompt_design.md` (spec secs 1, 2, 4, 5, 6), `prompts/phase2_case_study_prompt_v1.md` (house prompt style), `phase1example/` (all five files, the output exemplar)

**Interfaces:**
- Consumes: run inputs `problem_path`, `references_path`, `output_path` (stated in the prompt's input block).
- Produces: the prompt file that Tasks 11 and 14 execute. Its output package must pass `check_phase1_package.ps1 -Stage generator`.

- [ ] **Step 1: Write the prompt**

Required content, in this order (prose in house style: countable rules, defensive behavior, honest failure; method concealment explicitly does NOT apply):

1. **Mission and inputs.** You generate the 5-file phase 1 package for one source problem. Inputs: `problem_path`, `references_path`, `output_path`. Students never see these files; name techniques freely.
2. **Ground-truth hierarchy** (verbatim from spec sec 5, items 1-3) plus the search discipline: read every book_map.json first (that set IS `books_searched`), shortlist from the index, open every shortlisted section file before citing; never cite unopened content.
3. **Step G1: problem LO.** One imperative `learning_objective` covering every part; `learning_objectives` array with one entry per part (part_id matching the problem's labels), per-part LO, `mapped_section_keys` as `<book_key>:<section_number>`, confidence 0-1, one-line rationale; single-entry mirror when the problem has no parts.
4. **Step G2: solve and self-check.** Solve fully, substitute the answer back into the original constraints, write verified_answer.txt as compact prose showing every operator-bearing step and every reported quantity (the phase1example verified_answer.txt is the density exemplar). If no self-consistent solution: write phase1_error.txt (rule 8) and STOP with no other files.
5. **Step G3: search and score.** Score candidate sections on the four rubric dimensions, each 0 to 1 in steps of 0.05: `topic_keyword_match` (problem vocabulary vs section keywords), `lo_explicit_match` (a section LO explicitly states the tested skill, not merely a prerequisite), `exercise_pattern_match` (worked examples of the same task shape), `course_level_match`. Anchors: 0.2 = tangential, shares vocabulary only; 0.5 = teaches a genuine component of the skill but not the whole skill; 0.8 = explicitly teaches the tested skill with imitable worked examples. `confidence_score` = median of the four. `mapping_confidence`: LOW below 0.5, MEDIUM 0.5 to 0.75, HIGH above 0.75. Exactly one PRIMARY (the section a student would learn the tested skill FROM); SUPPORTING sections by judgment, 1 to 3, default 2. Honesty rule: if nothing teaches the skill, set `no_primary_available` / `fallback_sections` / `no_coverage_reasoning` instead of promoting a weak match with inflated scores; justifications must name what the section covers AND what it does not (the example's PRIMARY justification is the model).
6. **Step G4: extracts.** primary.md and supporting_NN.md in the house extract format: `# <Book short name> Sec <number>: <title>` then `**OER:**`, `**Source:**`, `**License:**`, `**Attribution required:**` lines built from book_map.json only; `## Section Outcomes / Learning Objectives`; `## Section Topics`; `## Content` with definitions, theorems, procedures, and worked examples carrying unique anchors `{#<book_tag>-<section>-<kind>-<n>}`, kind in def, thm, ex, proc; 1 to 3 pages of markdown each; everything the justification cites must appear; clean standard LaTeX, ASCII, no crawl macros.
7. **Step G5: lo_mapping.json.** Emit the FULL schema with this exact field inventory and these sentinels (values in angle brackets are filled; everything else verbatim):

```json
{
  "state": "FOUND",
  "template_id": "",
  "learning_objective": "<G1>",
  "learning_objectives": ["<G1 entries>"],
  "source_course_level": "<course_level from the matched corpus, e.g. calculus_1>",
  "rubric_scores": {
    "topic_keyword_match": 0.0,
    "lo_explicit_match": 0.0,
    "exercise_pattern_match": 0.0,
    "course_level_match": 0.0
  },
  "confidence_score": 0.0,
  "mapping_confidence": "<LOW|MEDIUM|HIGH>",
  "confidence_rubric_version": 1,
  "no_primary_available": false,
  "sections": [
    {
      "book_key": "<from book_map>",
      "section_number": "<n.m>",
      "section_title": "<from book_map>",
      "page_uuid": "",
      "openstax_url": "<source_url based when known, else empty>",
      "role": "<PRIMARY|SUPPORTING>",
      "justification": "<covers AND does-not-cover>",
      "learning_objectives": ["<section LOs from book_map>"],
      "also_in_books": [],
      "corpus": "<book_tag>",
      "artifact_ids": []
    }
  ],
  "books_searched": ["<every book_key found in references>"],
  "no_coverage_reasoning": "",
  "fallback_sections": [],
  "error_type": "",
  "error_message": "",
  "source": "dynamic",
  "critique_score": null,
  "critique_findings": [],
  "missing_concepts": ["<draft: every concept the problem needs that no cited section teaches, one-line self-contained facts usable as reference data>"],
  "primary_assessment": "",
  "supporting_assessment": "",
  "recommended_changes": [],
  "search_reasonable": null,
  "multipart_assessment": "",
  "critique_status": "pending"
}
```

8. **Failure rule.** Unsolvable or ambiguous problem, or unreadable corpus: write phase1_error.txt containing exactly one line, `ERROR: <category>: <specific reason>. No phase 1 package generated.` and nothing else.
9. **Output checklist** (the prompt's own preflight): five files present with the fixed names; JSON valid with the full field inventory; every cited anchor exists in an extract; ASCII everywhere; attribution lines match book_map; sentinels untouched.

- [ ] **Step 2: Static checks on the prompt file**

```powershell
$p = Get-Content prompts/phase1_generator_prompt_v1.md -Raw
@('phase1_error.txt','median','critique_status','"pending"','books_searched','{#','Attribution required','no_primary_available','0.05') | ForEach-Object { if ($p -notmatch [regex]::Escape($_)) { Write-Output ("MISSING " + $_) } }
if ([regex]::IsMatch($p, '[^\x00-\x7F]')) { Write-Output "NON-ASCII" }
```

Expected: no output.

- [ ] **Step 3: Commit**

```powershell
git add prompts/phase1_generator_prompt_v1.md
git commit -m "Added phase 1 generator prompt"
```

---

### Task 10: Critic prompt

**Files:**
- Create: `prompts/phase1_critic_prompt_v1.md`
- Read first: `plan/phase1_prompt_design.md` (spec secs 3, 5, 6), `prompts/phase1_generator_prompt_v1.md` (shared vocabulary), `phase1example/lo_mapping.json` (critique-field exemplar)

**Interfaces:**
- Consumes: run inputs `problem_path`, `references_path`, `output_path` (the generator's draft package lives in `output_path`).
- Produces: the prompt file Tasks 12, 13, and 14 execute. After it runs, the package must pass `check_phase1_package.ps1 -Stage critic`; on calibration mismatch it must instead produce phase1_error.txt and leave every draft untouched.

- [ ] **Step 1: Write the prompt**

Required content, in this order:

1. **Mission and inputs.** You are an independent auditor of a phase 1 package; you did not produce it. Inputs: `problem_path`, `references_path`, `output_path`.
2. **Ordering mandate, stated as the first hard rule:** read problem.txt FIRST and re-solve it completely, writing out your own full solution, BEFORE opening verified_answer.txt or any other draft file. Opening a draft first voids the audit.
3. **Calibration gate.** Compare every reported quantity of your solution against verified_answer.txt. Any mismatch: write phase1_error.txt containing exactly one line, `ERROR: calibration failed: independent re-derivation disagrees with verified_answer.txt (first disagreement: <quantity>: critic <x> vs generator <y>). Package not certified; do not feed to phase 2.` then STOP; modify nothing else.
4. **Audit checklist** (each item produces a finding or an explicit non-finding, per the recon non-findings-ledger pattern):
   - Independent search: re-read every book_map.json; name any better candidate section the mapper missed or state that none exists.
   - Anchor verification: every anchor in the extracts is unique; everything the justifications cite appears in the extracts.
   - Faithfulness: spot-check extract claims against the corpus section files; invented content is a finding.
   - Bookkeeping: `books_searched` equals the set of book_map.json files present; attribution lines match book_map; rubric scores are defensible against the written anchors (0.2/0.5/0.8).
   - Coverage: can a student solve EVERY part of the problem from the cited sections plus missing_concepts? Anything uncovered goes INTO missing_concepts.
5. **Write the critique fields only:** `critique_score`, `critique_findings` (specific, evidence-backed), `primary_assessment`, `supporting_assessment`, `recommended_changes`, `multipart_assessment` (single_part | complete | multipart_missing_parts), `search_reasonable`, `critique_status: "completed"`, and verify/extend `missing_concepts`. REPORT-ONLY rule: never rewrite the mapper's sections, scores, justifications, or the extracts; weak mappings ship with honest critique attached (Peter's example is the model: LOW, needs_change, shipped anyway).
6. **Output checklist:** lo_mapping.json still parses with the full field inventory; only critique-owned fields and missing_concepts changed; ASCII preserved.

- [ ] **Step 2: Static checks on the prompt file**

```powershell
$p = Get-Content prompts/phase1_critic_prompt_v1.md -Raw
@('BEFORE opening','calibration failed','Package not certified','critique_status','"completed"','missing_concepts','non-finding','REPORT-ONLY','multipart_missing_parts') | ForEach-Object { if ($p -notmatch [regex]::Escape($_)) { Write-Output ("MISSING " + $_) } }
if ([regex]::IsMatch($p, '[^\x00-\x7F]')) { Write-Output "NON-ASCII" }
```

Expected: no output.

- [ ] **Step 3: Commit**

```powershell
git add prompts/phase1_critic_prompt_v1.md
git commit -m "Added phase 1 critic prompt"
```

---

### Task 11: Happy-path test, generator stage

**Files:**
- Create: `phase1_runs/water_tank/problem.txt`
- Create (by the generator agent): `phase1_runs/water_tank/{primary.md, supporting_01.md, supporting_02.md, lo_mapping.json, verified_answer.txt}`

**Interfaces:**
- Consumes: prompts/phase1_generator_prompt_v1.md, references/openstax_calculus_v1/, tools/check_phase1_package.ps1.
- Produces: a generator-stage package that Task 12 critiques and Task 13 snapshots.

- [ ] **Step 1: Write the test problem**

Create `phase1_runs/water_tank/problem.txt` with exactly this content:

```text
A municipal water utility is reviewing overnight refill operations at its hilltop storage tank. Starting at midnight (t = 0), water flows into the tank at a rate of R(t) = 300t - 30t^2 gallons per hour, where t is measured in hours and the model is valid for 0 <= t <= 8.

Working from this model, complete the following tasks in order:

(i) Find the time at which the inflow rate is greatest during the refill window, and compute the inflow rate at that time.

(ii) Compute the total volume of water added to the tank from t = 0 to t = 8.

(iii) The tank's overflow protocol engages if more than 5,000 gallons enter during the 8-hour window. Using your result from (ii), state whether the protocol engages.

(iv) A technician estimates the total volume by multiplying the peak rate from (i) by 8 hours. Explain why this estimate disagrees with your result from (ii), state which is larger, and identify the property of R(t) that causes the discrepancy.
```

Hand-verified expected answers (the reviewer's key for Step 4; worked out during planning):
- (i) R'(t) = 300 - 60t = 0 at t = 5 hours; R(5) = 1500 - 750 = 750 gallons per hour (R'' = -60 < 0, endpoints give 0 and 480).
- (ii) integral 0 to 8 of (300t - 30t^2) dt = [150t^2 - 10t^3] from 0 to 8 = 9600 - 5120 = 4480 gallons.
- (iii) 4480 <= 5000, the protocol does NOT engage.
- (iv) 750 x 8 = 6000 > 4480; overestimate because R(t) is below its peak everywhere except t = 5 (a varying rate cannot be treated as constant).

- [ ] **Step 2: Run the generator in a fresh subagent**

Dispatch a fresh general-purpose agent with this prompt (record the caveat that harness subagents load CLAUDE.md, so the run is semi-fresh):

```text
Read C:\Users\hitaa\Downloads\MathGPT\prompts\phase1_generator_prompt_v1.md and execute it exactly with these inputs: problem_path = phase1_runs/water_tank/problem.txt, references_path = references, output_path = phase1_runs/water_tank. Work autonomously. Your final message: the list of files you wrote and one line per file saying what it is.
```

- [ ] **Step 3: Validate mechanically**

Run: `powershell -File tools/check_phase1_package.ps1 -PackagePath phase1_runs/water_tank -Stage generator`
Expected: exit 0, all checks PASS.

- [ ] **Step 4: Verify the arithmetic and the mapping by hand**

Compare verified_answer.txt against the Step 1 key: t = 5, 750 gal/hr, 4480 gallons, protocol does not engage, 6000 vs 4480. Every quantity must match. Then sanity-read lo_mapping.json: PRIMARY should be a chapter 4 or chapter 5 section (maxima/optimization or integration/net change); rubric scores populated; confidence_score equals the median of the four rubric scores; missing_concepts drafted (may legitimately be short for this well-covered problem). Any arithmetic mismatch is a FAILED test: diagnose (bad prompt rule vs bad model run) before proceeding, and log the failure in CLAUDE.md.

- [ ] **Step 5: Commit**

```powershell
git add phase1_runs/water_tank
git commit -m "Phase 1 happy-path test: generator stage green"
```

---

### Task 12: Happy-path test, critic stage (plus pre-critic snapshot)

**Files:**
- Create: `phase1_runs/water_tank_corrupted/` (byte-for-byte copy of the generator-stage package, made BEFORE the critic runs; Task 13 uses it)
- Modify (by the critic agent): `phase1_runs/water_tank/lo_mapping.json` (critique fields only)

**Interfaces:**
- Consumes: prompts/phase1_critic_prompt_v1.md, the Task 11 package.
- Produces: a certified package for Task 14's end-to-end run; the snapshot for Task 13.

- [ ] **Step 1: Snapshot the generator stage**

```powershell
Copy-Item phase1_runs/water_tank phase1_runs/water_tank_corrupted -Recurse
```

- [ ] **Step 2: Run the critic in a fresh subagent**

```text
Read C:\Users\hitaa\Downloads\MathGPT\prompts\phase1_critic_prompt_v1.md and execute it exactly with these inputs: problem_path = phase1_runs/water_tank/problem.txt, references_path = references, output_path = phase1_runs/water_tank. Work autonomously. Your final message: your independent answers to the problem parts, whether calibration passed, and a list of the critique findings you recorded.
```

- [ ] **Step 3: Validate mechanically**

Run: `powershell -File tools/check_phase1_package.ps1 -PackagePath phase1_runs/water_tank -Stage critic`
Expected: exit 0. Also check `git diff --stat phase1_runs/water_tank` shows ONLY lo_mapping.json changed (report-only rule held) and no phase1_error.txt exists.

- [ ] **Step 4: Read the critique**

critique_findings must be specific (or explicit non-findings); assessments filled; multipart_assessment one of the three allowed values; missing_concepts verified or extended. Vague filler ("looks good") is a failed test of the critic prompt.

- [ ] **Step 5: Commit**

```powershell
git add phase1_runs/water_tank phase1_runs/water_tank_corrupted
git commit -m "Phase 1 happy-path test: critic stage green"
```

---

### Task 13: Negative control A, calibration gate

**Files:**
- Modify: `phase1_runs/water_tank_corrupted/verified_answer.txt` (one number corrupted)
- Create (by the critic agent): `phase1_runs/water_tank_corrupted/phase1_error.txt`

**Interfaces:**
- Consumes: prompts/phase1_critic_prompt_v1.md, the Task 12 snapshot.
- Produces: proof the calibration gate fires; the future fixture-suite negative control.

- [ ] **Step 1: Corrupt one number**

In `phase1_runs/water_tank_corrupted/verified_answer.txt`, change the total volume 4480 to 4520 (every occurrence of 4480 in that file). Do not touch any other file.

- [ ] **Step 2: Run the critic on the corrupted package**

Same dispatch text as Task 12 Step 2 with `water_tank` replaced by `water_tank_corrupted` in both paths.

- [ ] **Step 3: Verify the gate fired**

Expected, all three:
1. `phase1_runs/water_tank_corrupted/phase1_error.txt` exists and matches the spec line: starts with `ERROR: calibration failed: independent re-derivation disagrees with verified_answer.txt` and ends with `Package not certified; do not feed to phase 2.`, naming the disagreeing quantity (critic 4480 vs generator 4520).
2. `lo_mapping.json` in that directory still has `critique_status: "pending"` (critic touched nothing).
3. `powershell -File tools/check_phase1_package.ps1 -PackagePath phase1_runs/water_tank_corrupted -Stage generator` still exits 0 (drafts intact).

A critic that "helpfully fixes" 4520 back to 4480, or critiques anyway, is a FAILED control: fix the prompt, rerun.

- [ ] **Step 4: Commit**

```powershell
git add phase1_runs/water_tank_corrupted
git commit -m "Phase 1 negative control: calibration gate fires"
```

---

### Task 14: Negative control B, honest no-coverage

**Files:**
- Create: `phase1_runs/simplex_coverage/problem.txt` (copy of phase1example/problem.txt)
- Create (by the agents): the package files in `phase1_runs/simplex_coverage/`

**Interfaces:**
- Consumes: both prompts, the calc-only corpus.
- Produces: proof the mapper refuses to fake coverage when the corpus lacks the topic.

- [ ] **Step 1: Stage the problem**

```powershell
New-Item -ItemType Directory -Force phase1_runs/simplex_coverage
Copy-Item phase1example/problem.txt phase1_runs/simplex_coverage/problem.txt
```

- [ ] **Step 2: Run generator, then critic** (same dispatch texts as Tasks 11/12 with `water_tank` replaced by `simplex_coverage`)

- [ ] **Step 3: Verify honesty**

Expected:
1. verified_answer.txt values match Peter's phase1example/verified_answer.txt (entering variable y1, pivot row 1, y1 = 15, y4 = 60, P = 75, optimal). This is a free golden check of the solve step.
2. lo_mapping.json: `books_searched` = ["openstax_calculus_v1"] only; EITHER `no_primary_available: true` with `no_coverage_reasoning` filled, OR a weak PRIMARY with mapping_confidence LOW and honest justifications; missing_concepts lists at least 3 simplex-specific items (entering-variable rule, ratio test, optimality criterion at minimum); NO fabricated sections or books.
3. `powershell -File tools/check_phase1_package.ps1 -PackagePath phase1_runs/simplex_coverage -Stage critic` exits 0.

Confident fake citations (e.g. claiming an OpenStax calculus section teaches simplex pivoting) are a FAILED control: fix the generator prompt's honesty rule, rerun.

- [ ] **Step 4: Commit**

```powershell
git add phase1_runs/simplex_coverage
git commit -m "Phase 1 negative control: honest no-coverage on simplex vs calc corpus"
```

---

### Task 15: End-to-end into phase 2

**Files:**
- Create (by the phase 2 agent): `cases/tests/test_phase1_e2e_water_tank_case.tex`
- Create: `cases/tests/test_phase1_e2e_water_tank_case.pdf` (tectonic output)

**Interfaces:**
- Consumes: the certified Task 12 package, prompts/phase2_case_study_prompt_v1.md, tools/tectonic.exe.
- Produces: proof our phase 1 output drives our phase 2 prompt end to end.

- [ ] **Step 1: Run phase 2 on the phase 1 package**

Dispatch a fresh agent:

```text
Read C:\Users\hitaa\Downloads\MathGPT\prompts\phase2_case_study_prompt_v1.md. Execute it with the five files in C:\Users\hitaa\Downloads\MathGPT\phase1_runs\water_tank as the tagged input blocks (problem.txt -> <problem>, primary.md -> <primary_section>, all supporting_*.md with their headers -> <supporting_sections>, lo_mapping.json -> <lo_mapping>, verified_answer.txt -> <verified_answer>). All optional inputs at their defaults. Write the complete LaTeX output to cases/tests/test_phase1_e2e_water_tank_case.tex.
```

- [ ] **Step 2: Check gate and banner behavior**

Expected: a case was generated (no `% ERROR` calibration refusal, since verified_answer.txt is correct); the `% WARNING` banner appears if and only if the package's mapping was weak per phase 2's trigger list (check lo_mapping.json's mapping_confidence and assessments, then check the .tex top for consistency).

- [ ] **Step 3: Compile**

Run: `tools\tectonic.exe cases\tests\test_phase1_e2e_water_tank_case.tex`
Expected: exit 0, first pass. Read the PDF once to sanity-check layout.

- [ ] **Step 4: Verify the case's own numbers**

The case must use FRESH numbers (not 4480/750). Re-derive every boxed number in the % VERIFICATION block by hand; all must check out. Any mismatch is a failed test (phase 2 regression or bad package): diagnose and log.

- [ ] **Step 5: Commit**

```powershell
git add cases/tests/test_phase1_e2e_water_tank_case.tex cases/tests/test_phase1_e2e_water_tank_case.pdf
git commit -m "Phase 1 end-to-end test through phase 2 green"
```

---

### Task 16: Wrap-up: log everything in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (secs 5, 6, 12, 13, 14, 15)

**Interfaces:**
- Consumes: results of Tasks 1-15.
- Produces: project memory consistent with reality.

- [ ] **Step 1: Update CLAUDE.md**

- Sec 5 prompt lineage: add a `phase1 v1` entry (generator + critic, one line each on contents, test results).
- Sec 6: add the phase 1 test runs (water_tank happy path, both negative controls, e2e case) with their key numbers and caveats.
- Sec 12: log residual caveats (semi-fresh subagents, one model family, single runs, corpus is chapters 1-6 of one book, golden diff still deferred).
- Sec 13: mark backlog items done/updated; keep the references/ push decision (backlog 8) open unless Hitaansh has ruled.
- Sec 14: rewrite ACTIVE TASK: phase 1 prompts COMPLETE; next = show Peter, add LA books + golden diff, re-map sec 7 pipeline plan.
- Sec 15: add references/openstax_calculus_v1/, phase1_runs/, tools/check_phase1_package.ps1, both prompt files, this plan file.

- [ ] **Step 2: Final tree check and commit**

Run: `git status --short` (expected: only CLAUDE.md modified), then:

```powershell
git add CLAUDE.md
git commit -m "Logged phase 1 build and test results"
```
