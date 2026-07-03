# REFERENCE_EXTRACTS.md

Reference code extracted verbatim (read-only) from the v3.26.9 audit package, for reuse in our
own pipeline (LLM-authored JSON case spec → SymPy verification with evidence → LaTeX renderer +
numeric-identity lint → LLM judge checklist ledger → fixture suites with negative controls as CI).
Trims inside blocks are marked `# ... trimmed ...`. Everything that remains is copied exactly.

---

## 1. Validator skeleton

**Source:** `tools/validate_package.py` (333 lines total)

**Adapt:** This is the single CI entrypoint. Keep: the explicit read-only contract, exit-code
convention (0 pass / 2 fail), a `checks` dict of `PASS|FAIL` per check name plus a `problems`
list of coded objects, and the final self-validation of the report against its own schema (so
the report format can never drift from the schema silently). Note there is no fixture *discovery*
magic — each suite is an explicit block that imports the tool under test in-process, loads
`expected_results.json`, and diffs actual vs expected status/codes. Copy that explicitness.

```python
#!/usr/bin/env python3
import argparse, json, subprocess, sys, hashlib, os, importlib.util, tempfile
from pathlib import Path
sys.dont_write_bytecode=True
DEBUG_PATTERNS={'__MACOSX','__pycache__','.DS_Store','.Rhistory'}
try:
    import jsonschema
except Exception:
    jsonschema=None

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def load(p, default=None):
    try: return json.loads(Path(p).read_text())
    except Exception:
        if default is not None: return default
        raise

def import_module(path,name):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod

def run(cmd,cwd,timeout=20):
    env=os.environ.copy(); env['PYTHONDONTWRITEBYTECODE']='1'
    try: return subprocess.run(['timeout',str(timeout)]+list(cmd),cwd=cwd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,env=env)
    except FileNotFoundError:
        try: return subprocess.run(cmd,cwd=cwd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,timeout=timeout,env=env)
        except subprocess.TimeoutExpired:
            class R: pass
            r=R(); r.returncode=124; r.stdout=''; r.stderr='TIMEOUT'; return r

def expect_obj(expected):
    if isinstance(expected,dict): return expected.get('expected_status'), expected.get('expected_issue_codes',[])
    return expected, []

def validate(root_arg):
    root=Path(root_arg).resolve(); problems=[]; checks={}; artifact_hashes={}
    tmp=Path(tempfile.mkdtemp(prefix='vpkg_'))
    # IMPORTANT v3.26.9: validation is read-only. Do not delete, clean, or rewrite package files.
    if jsonschema is None:
        checks['jsonschema_dependency']='FAIL'
        problems.append({'code':'JSONSCHEMA_DEPENDENCY_MISSING','message':'jsonschema is required and validation may not skip schema gates.'})
    else:
        checks['jsonschema_dependency']='PASS'
    # debug artifacts  (one representative check, end to end)
    debug=[]
    for p in root.rglob('*'):
        if any(part in DEBUG_PATTERNS for part in p.parts) or p.name in DEBUG_PATTERNS or p.suffix=='.pyc':
            if '_validation_tmp' not in p.parts:
                debug.append(str(p.relative_to(root)))
    checks['debug_artifacts']='PASS' if not debug else 'FAIL'
    if debug: problems.append({'code':'DEBUG_ARTIFACTS_PRESENT','items':debug[:50],'count':len(debug)})
    # ... trimmed ... (json_parse, manifests, file hash manifest, operator manual checks)
    # package gate fixtures  (one representative fixture-suite block; the other ~10 suites repeat this shape)
    gate_probs=[]
    try:
        gate_mod=import_module(root/'tools/package_gate_evaluator.py','gate')
        exp=load(root/'fixtures/package_gate/expected_results.json',{})
        for name,expected in exp.items():
            candidates=[root/'fixtures/package_gate'/name/'run_state.json', root/'fixtures/package_gate'/f'{name}.json']
            fp=next((p for p in candidates if p.exists()),None)
            if fp is None: gate_probs.append({'fixture':name,'issue':'missing'}); continue
            res=gate_mod.eval_state(load(fp)); exp_status,_=expect_obj(expected)
            if res.get('status')!=exp_status: gate_probs.append({'fixture':name,'expected':exp_status,'actual':res})
    except Exception as e: gate_probs.append({'check':'package_gate_exception','error':str(e)})
    checks['package_gate_fixtures']='PASS' if not gate_probs else 'FAIL'
    if gate_probs: problems.append({'code':'PACKAGE_GATE_FIXTURE_FAIL','items':gate_probs})
    # ... trimmed ... (diagnostic, phase2, answerbox, semantic, lifecycle-schema, source-math,
    #                  run-lifecycle, golden-rule, postprocessor fixture suites; smoke tests;
    #                  anti-regression and change-control checks — all follow the block above)
    result={'profile':'v3.26.9','status':'PASS' if not problems else 'FAIL','checks':checks,'artifact_hashes':artifact_hashes,'ready_for_human_review':False,'problems':problems}
    # self-validate report schema
    if jsonschema is not None and (root/'schemas/package_validation_report_schema.json').exists():
        try:
            schema=load(root/'schemas/package_validation_report_schema.json')
            jsonschema.Draft202012Validator(schema).validate(result)
        except Exception as e:
            result['status']='FAIL'; result['checks']['package_validation_report_schema']='FAIL'; result['problems'].append({'code':'PACKAGE_VALIDATION_REPORT_SCHEMA_SELF_CHECK_FAILED','error':str(e)})
    return result

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('root',nargs='?',default='.')
    args=ap.parse_args(); res=validate(args.root); print(json.dumps(res,indent=2)); return 0 if res['status']=='PASS' else 2
if __name__=='__main__': raise SystemExit(main())
```

---

## 2. Fixture suite pattern

**Source:** `fixtures/answerbox_setup/` (smallest complete suite: one good case, one negative
control, one `expected_results.json`) plus the loader block in `tools/validate_package.py:142-154`.

**Adapt:** `expected_results.json` maps case-directory name → expected status (string shorthand,
or `{"expected_status":..., "expected_issue_codes":[...]}` for suites that also pin issue codes —
see `expect_obj` in extract 1). The negative control here is the important idea: a contract that
*claims* PASS and looks plausible but omits its evidence — the validator must flip it to FAIL.
Build one suite per verifier in our pipeline (SymPy evidence checker, LaTeX identity lint, judge
ledger), each with a good case and at least one bad-that-looks-good case.

`fixtures/answerbox_setup/expected_results.json`:

```json
{
  "good": "PASS",
  "bad_missing_evidence": "FAIL"
}
```

`fixtures/answerbox_setup/good/answerbox_setup_contract.json`:

```json
{
  "status": "PASS",
  "parts": [
    {
      "semantic_part_id": "p1",
      "display_part_label": "a.",
      "logical_answer_order": 0,
      "concrete_answer_index": 0,
      "answer_type": "number",
      "answer_key_present": true,
      "question_prompt_line": 3,
      "answerbox_line": 4,
      "placement_correct": true,
      "leakage_absent": true,
      "tolerance_or_format_settings_checked": true,
      "answer_kind_or_shape_matches_prompt": true,
      "evidence_lines": [
        "QUESTION line 3 prompt, line 4 answerbox[0]",
        "COMMON_CONTROL answer[0] and anstypes[0]"
      ]
    }
  ]
}
```

`fixtures/answerbox_setup/bad_missing_evidence/answerbox_setup_contract.json` — identical to the
good case except `evidence_lines` is absent (the whole point of the negative control):

```json
{
  "status": "PASS",
  "parts": [
    {
      "semantic_part_id": "p1",
      "display_part_label": "a.",
      "logical_answer_order": 0,
      "concrete_answer_index": 0,
      "answer_type": "number",
      "answer_key_present": true,
      "question_prompt_line": 3,
      "answerbox_line": 4,
      "placement_correct": true,
      "leakage_absent": true,
      "tolerance_or_format_settings_checked": true,
      "answer_kind_or_shape_matches_prompt": true
    }
  ]
}
```

Loader + diff, `tools/validate_package.py:142-154` (uses `load`, `import_module`, `expect_obj`
from extract 1):

```python
    # answerbox fixtures
    ab_probs=[]
    try:
        ab_mod=import_module(root/'tools/answerbox_setup_audit.py','answerbox_setup_audit')
        exp=load(root/'fixtures/answerbox_setup/expected_results.json',{})
        for name,expected in exp.items():
            fp=root/'fixtures/answerbox_setup'/name/'answerbox_setup_contract.json'
            if not fp.exists(): ab_probs.append({'fixture':name,'issue':'missing'}); continue
            res=ab_mod.validate_contract(load(fp)); exp_status,_=expect_obj(expected)
            if res.get('status')!=exp_status: ab_probs.append({'fixture':name,'expected':exp_status,'actual':res})
    except Exception as e: ab_probs.append({'check':'answerbox_setup_exception','error':str(e)})
    checks['answerbox_setup_fixtures']='PASS' if not ab_probs else 'FAIL'
    if ab_probs: problems.append({'code':'ANSWERBOX_SETUP_FIXTURE_FAIL','items':ab_probs})
```

---

## 3. Forbidden-change scan

**Source:** `tools/render_format_engine/v3269_format_postprocessor.py` (77 lines total)

**Adapt:** Three ideas to copy. (1) Refusal guard: the tool refuses to touch the artifact at all
unless the plan asserts `semantic_safety_verified: true` — and on refusal it still emits a full
report but writes no output and exits 2. (2) Protected-field extraction is delegated to a shared
comparator run on both before and after text, so the scan is *computed*, never attested. (3)
`_norm_fmt` strips exactly the authorized format transformations before comparing prose blocks,
so only semantic diffs can trip the scan. For us: protected fields become answer values, answer
types, formulas, and question counts from the JSON case spec, compared pre/post-render.

```python
def h(txt): return hashlib.sha256(txt.encode()).hexdigest()
def split_blocks(txt):
    out={}; cur=None; arr=[]
    for line in txt.splitlines():
        m=re.match(r'<<<([A-Z_]+)>>>',line.strip())
        if m:
            if cur: out[cur]='\n'.join(arr)
            cur=m.group(1); arr=[]
        else:
            if cur: arr.append(line)
    if cur: out[cur]='\n'.join(arr)
    return out

def main():
    # ... trimmed ... (argparse: template, plan, --out, --report, --diff)
    inp=Path(template).read_text(); plan=json.loads(Path(plan_path).read_text())
    requested=plan.get('authorized_change_classes') or []
    report={'mode':'phase6_single_postprocess','input_template_hash':h(inp),'output_template_hash':None,'plan_hash':h(Path(plan_path).read_text()),'changes_made':[],'changes_refused':[],'allowed_change_classes_requested':requested,'allowed_change_classes_applied':[],'unauthorized_change_classes':[],'forbidden_change_scan':{},'status':'BLOCKED_RETURN_TO_PHASE_5'}
    if plan.get('semantic_safety_verified') is not True:
        report['changes_refused'].append({'reason':'semantic_safety_verified_missing_or_false'})
        write_if(args.report,json.dumps(report,indent=2)); print(json.dumps(report,indent=2)); return 2
    out=inp; before=split_blocks(inp)
    # ... trimmed ... (the four authorized change classes: ordinary_prose_tag_removal,
    #                  stacked_br_removal, prompt_answerbox_br_insertion, part_label_normalization)
    after=split_blocks(out)
    scan={}
    def field(name,val,method): scan[name]={'value':bool(val),'status':'VERIFIED','verification_method':method}
    field('common_control_changed', before.get('COMMON_CONTROL','')!=after.get('COMMON_CONTROL',''), 'block_hash_compare')
    # FIX-22: COMPUTE the 8 forbidden-change fields on before->after (previously hardcoded value=False attestation).
    import importlib.util as _ilu
    _cs=_ilu.spec_from_file_location('cfcc', str(Path(__file__).resolve().parents[1]/'computed_forbidden_change_comparator.py'))
    _cfcc=_ilu.module_from_spec(_cs); _cs.loader.exec_module(_cfcc)
    _pre=_cfcc.extract(inp); _post=_cfcc.extract(out)
    def _chg(fld): return _pre.get(fld)!=_post.get(fld)
    def _norm_fmt(s):  # strip exactly the authorized format transformations so only SEMANTIC diffs remain
        s=re.sub(r'</?p[^>]*>','',s,flags=re.I); s=re.sub(r'</?strong[^>]*>','',s,flags=re.I)
        s=re.sub(r'(?:<br\s*/?>\s*)+',' ',s,flags=re.I); s=re.sub(r'\bPart\s+([a-z])\.',r'\1.',s)
        return re.sub(r'\s+',' ',s).strip()
    field('answer_keys_changed', _chg('answer_keys'), 'computed_forbidden_change_comparator')
    field('answer_types_changed', _chg('answer_types') or _chg('anstypes'), 'computed_forbidden_change_comparator')
    field('randomization_changed', _chg('randomization'), 'computed_forbidden_change_comparator')
    field('graded_part_count_changed', _chg('graded_part_count'), 'computed_forbidden_change_comparator')
    field('source_deliverables_changed', _chg('source_deliverables'), 'computed_forbidden_change_comparator')
    field('math_formulas_changed', _chg('formula'), 'computed_forbidden_change_comparator')
    field('student_flow_semantics_changed', _norm_fmt(before.get('QUESTION',''))!=_norm_fmt(after.get('QUESTION','')), 'computed_format_normalized_block_compare')
    field('semantic_explanation_logic_changed', _norm_fmt(before.get('EXPLANATION',''))!=_norm_fmt(after.get('EXPLANATION','')), 'computed_format_normalized_block_compare')
    report['forbidden_change_scan']=scan
    if any(v['value'] for v in scan.values()):
        report['status']='FAIL'
        report['changes_refused'].append({'reason':'forbidden_change_scan_failed'})
        write_if(args.report,json.dumps(report,indent=2)); print(json.dumps(report,indent=2)); return 2
    report['status']='PASS'; report['output_template_hash']=h(out)
    # ... trimmed ... (write --out, --diff, --report; return 0)
```

---

## 4. Line-level evidence pattern

**Source:** `tools/answerbox_setup_audit.py` (47 lines total; `validate_contract` shown complete)

**Adapt:** The row contract for our per-answer SymPy evidence: every claim row must carry the
full `REQUIRED` field set; every proof boolean is checked with `is not True` (so `"yes"`, `1`, or
a summary string cannot sneak past); line references must be real ints ≥ 1 with ordering enforced
(`answerbox_line > question_prompt_line`); `evidence_lines` must be a non-empty list; and
duplicate ids/indexes/orders are rejected. Mirror with fields like `sympy_expr`,
`verified_equal` (exactly `True`), and `evidence_lines` holding the actual comparison performed.

```python
"""v3.26.9 answerbox setup contract/audit validator.

This validates an answerbox setup contract JSON artifact. It intentionally
requires line-level evidence and part-by-part proof rather than accepting a
summary such as cardinality_match=true.
"""
REQUIRED=['semantic_part_id','display_part_label','logical_answer_order','concrete_answer_index','answer_type','answer_key_present','question_prompt_line','answerbox_line','placement_correct','leakage_absent','tolerance_or_format_settings_checked','answer_kind_or_shape_matches_prompt','evidence_lines']

def validate_contract(obj):
    issues=[]
    if not isinstance(obj,dict): return {'status':'FAIL','issues':[{'code':'ANSWERBOX_CONTRACT_NOT_OBJECT'}]}
    if obj.get('status')!='PASS': issues.append({'code':'ANSWERBOX_CONTRACT_STATUS_NOT_PASS','status':obj.get('status')})
    parts=obj.get('parts')
    if not isinstance(parts,list) or not parts:
        issues.append({'code':'ANSWERBOX_CONTRACT_PARTS_EMPTY'}); parts=[]
    seen_idx=[]; seen_sem=[]; seen_order=[]
    for i,row in enumerate(parts):
        if not isinstance(row,dict):
            issues.append({'code':'ANSWERBOX_PART_NOT_OBJECT','part_index':i}); continue
        for k in REQUIRED:
            if k not in row: issues.append({'code':'ANSWERBOX_PART_REQUIRED_FIELD_MISSING','part_index':i,'field':k})
        idx=row.get('concrete_answer_index'); sid=row.get('semantic_part_id'); order=row.get('logical_answer_order')
        if idx in seen_idx: issues.append({'code':'DUPLICATE_CONCRETE_ANSWER_INDEX','index':idx})
        seen_idx.append(idx)
        if sid in seen_sem: issues.append({'code':'DUPLICATE_SEMANTIC_PART_ID','semantic_part_id':sid})
        seen_sem.append(sid)
        if order in seen_order: issues.append({'code':'DUPLICATE_LOGICAL_ANSWER_ORDER','logical_answer_order':order})
        seen_order.append(order)
        for flag in ['answer_key_present','placement_correct','leakage_absent','tolerance_or_format_settings_checked','answer_kind_or_shape_matches_prompt']:
            if row.get(flag) is not True: issues.append({'code':'ANSWERBOX_PART_FLAG_NOT_TRUE','part_index':i,'field':flag,'value':row.get(flag)})
        if not isinstance(row.get('question_prompt_line'),int) or row.get('question_prompt_line')<1: issues.append({'code':'QUESTION_PROMPT_LINE_INVALID','part_index':i})
        if not isinstance(row.get('answerbox_line'),int) or row.get('answerbox_line')<1: issues.append({'code':'ANSWERBOX_LINE_INVALID','part_index':i})
        if isinstance(row.get('question_prompt_line'),int) and isinstance(row.get('answerbox_line'),int) and row.get('answerbox_line') <= row.get('question_prompt_line'):
            issues.append({'code':'ANSWERBOX_NOT_AFTER_PROMPT','part_index':i})
        if not row.get('answer_type'): issues.append({'code':'ANSWER_TYPE_MISSING','part_index':i})
        ev=row.get('evidence_lines')
        if not isinstance(ev,list) or not ev: issues.append({'code':'ANSWERBOX_EVIDENCE_LINES_MISSING','part_index':i})
    return {'tool':'answerbox_setup_audit','profile':'v3.26.9','status':'PASS' if not issues else 'FAIL','issues':issues}
```

---

## 5. Gate evaluator pattern

**Source:** `tools/package_gate_evaluator.py` (286 lines total)

**Adapt:** Three mechanisms to copy. (1) Closed status vocabulary: the terminal gate accepts only
`FINAL_ALLOWED_STATUSES`; phase-level statuses (`GO`/`PASS`/...) used as a final status are
rejected by name, as is the generic `READY_FOR_HUMAN_REVIEW` without a verification suffix.
(2) Completeness matrix: every phase artifact must be literally `'COMPLETE'` — anything else,
including a missing key, is enumerated as missing. (3) Independent re-derivation: instead of
trusting an earlier lint report in the state file, `eval_state` re-extracts the final artifact
text and re-runs the runtime-policy checks itself (`_runtime_policy_issues`). For us: the ledger
gate should re-run one SymPy spot-check rather than trusting the verifier's own report.

```python
FINAL_ALLOWED_STATUSES = {
 'READY_FOR_HUMAN_REVIEW_STATIC_VERIFIED','READY_FOR_HUMAN_REVIEW_RENDER_VERIFIED',
 'HUMAN_REVIEW_REQUESTS_CHANGES','HUMAN_REVIEW_APPROVED_FOR_DEPLOYMENT','REPAIR_REQUIRED_AFTER_HUMAN_RENDER_REVIEW',
 'NEEDS_HUMAN_REVIEW_AFTER_PHASE6','AWAITING_OPTIONAL_EXTERNAL_RENDER',
 'ENVIRONMENT_RENDER_HARNESS_ERROR_STATIC_VERIFIED',
 # ... trimmed ... (17 BLOCKED_* statuses, e.g. BLOCKED_MATH_VERIFICATION_FAILED,
 #                  BLOCKED_FORBIDDEN_CHANGE_SCAN_FAILED, BLOCKED_UNKNOWN_STATUS)
}
PHASE_GATE_STATUSES={'GO','NO_GO','PASS','FAIL','BLOCKED','REPAIR_NOW','REQUIRES_APPROVAL'}
READY_STATUSES={'READY_FOR_HUMAN_REVIEW_STATIC_VERIFIED','READY_FOR_HUMAN_REVIEW_RENDER_VERIFIED'}
REQUIRED_P2={'2A_assessment_contract','2B_worked_solution_blueprint','2C_student_facing_draft','2D_pre_code_pedagogy_audit'}
REQUIRED_P4={'4A_semantic_flow','4B_portal_control','4C_math_enumeration','4D_pedagogy_source_fidelity','4E_render_format_diagnostic','4F_inventory_scoring'}

def _runtime_policy_issues(cc,q):
    # independent re-derivation: re-parses the FINAL common-control text instead of
    # trusting any earlier lint report embedded in the run state
    issues=[]
    anstypes=_parse_anstypes(cc)
    if any(t=='essay' for t in anstypes): _add(issues,'TARGET_FORBIDDEN_ESSAY_ANTYPE')
    # ... trimmed ... (mult() macro and raw $showanswer interpolation regex checks)
    questions=_parse_questions(cc); answers=_parse_answers(cc); show=_parse_showanswers(cc)
    choice_idxs={i for i,t in enumerate(anstypes) if t in ('choices','multans')}
    for idx in sorted(choice_idxs):
        opts=questions.get(idx)
        if not opts or len(opts)<2:
            _add(issues,'CHOICES_MISSING_QUESTIONS_ARRAY',index=idx); continue
        if idx not in answers: _add(issues,'CHOICES_MISSING_INTEGER_ANSWER',index=idx)
        elif answers[idx]<0 or answers[idx]>=len(opts): _add(issues,'CHOICES_ANSWER_INDEX_OUT_OF_RANGE',index=idx)
        if idx not in show: _add(issues,'CHOICES_MISSING_SHOWANSWER',index=idx)
        elif not re.search(r'\$questions\s*\[\s*%d\s*\]'%idx, show[idx]): _add(issues,'CHOICES_SHOWANSWER_NOT_TIED_TO_QUESTIONS',index=idx)
    # ... trimmed ... (prompt-verb vs choice-verb mismatch scan over $answerbox lines)
    return issues

def _complete_phase_matrix(pcm):
    p2=pcm.get('phase_2') if isinstance(pcm,dict) else None
    p4=pcm.get('phase_4') if isinstance(pcm,dict) else None
    missing=[]
    if not isinstance(p2,dict): missing.append('phase_2'); p2={}
    if not isinstance(p4,dict): missing.append('phase_4'); p4={}
    for k in sorted(REQUIRED_P2):
        if p2.get(k)!='COMPLETE': missing.append('phase_2.'+k)
    for k in sorted(REQUIRED_P4):
        if p4.get(k)!='COMPLETE': missing.append('phase_4.'+k)
    return missing

def eval_state(s):
    if not isinstance(s,dict): return {'status':'FAIL','issues':[{'code':'INVALID_RUN_STATE_NOT_OBJECT'}]}
    issues=[]; status=str(s.get('final_status','') or '')
    if not status: _add(issues,'MISSING_FINAL_STATUS')
    elif status not in FINAL_ALLOWED_STATUSES:
        if status in PHASE_GATE_STATUSES: _add(issues,'PHASE_STATUS_USED_AS_FINAL_STATUS', status=status)
        else: _add(issues,'UNKNOWN_FINAL_STATUS', status=status)
    if status == 'READY_FOR_HUMAN_REVIEW' or (status.startswith('READY_FOR_HUMAN_REVIEW_') and status not in READY_STATUSES): _add(issues,'INVALID_READY_STATUS', status=status)
    if s.get('production_ready') or status.startswith('PRODUCTION_READY'): _add(issues,'PRODUCTION_READY_FORBIDDEN')
    ready=_ready_flags(s,status)
    if s.get('ready_for_human_review') and status not in READY_STATUSES: _add(issues,'READY_BOOLEAN_WITH_NON_READY_STATUS', status=status)
    # ... trimmed ... (human render review consistency; raw-LaTeX dialect failure scan;
    #                  embedded diagnostic reports checked via _bad_scan)
    cc,q=_extract_final_texts(s); rt=_runtime_policy_issues(cc,q)
    if rt:
        issues.extend({'code':'COMMON_CONTROL_RUNTIME_POLICY_FAILURE','detail':x} for x in rt)
        if ready: _add(issues,'READY_WITH_COMMON_CONTROL_RUNTIME_POLICY_FAILURE')
    rc=s.get('run_configuration')
    if ready:
        if not isinstance(rc,dict): _add(issues,'MISSING_RUN_CONFIGURATION_FOR_READY')
        else:
            if rc.get('checks_may_be_skipped') is not False: _add(issues,'RUN_CONFIG_ALLOWS_SKIPPED_CHECKS')
        missing=_complete_phase_matrix(s.get('phase_completion_matrix') or {})
        if missing: _add(issues,'INCOMPLETE_PHASE_COMPLETION_MATRIX', missing=missing)
        artifact_probs=_phase_artifact_problems(s)
        if artifact_probs: _add(issues,'PHASE_COMPLETION_ARTIFACT_PROOF_MISSING', missing=artifact_probs[:20])
    elif isinstance(rc,dict) and rc.get('checks_may_be_skipped') is not False:
        _add(issues,'RUN_CONFIG_ALLOWS_SKIPPED_CHECKS')
    # ... trimmed ... (final_imathas_files presence, _require_pass on the four final static
    #                  diagnostics, answerbox/derivation contract sufficiency, render-verified
    #                  requirements, dynamicity/fixed-instance policy, transformation approval,
    #                  concern ledger blockers, score scale, stem-choice leakage)
    return {'status':'PASS' if not issues else 'FAIL','issues':issues}
```

---

## Schema examples

Conventions across `schemas/`: snake_case filenames ending `_schema.json`; JSON Schema draft
2020-12; `title` mirrors the filename; UPPERCASE status enums; `additionalProperties: true` on
reports (forward-compatible), `false` on strict configs; `"const": false` used to pin safety
booleans (see `checks_may_be_skipped` in `run_configuration_schema.json`). Note: the literally
smallest gate-related schemas (e.g. `human_gate_decision_schema.json`, 157 bytes) are permissive
stubs — `{"type":"object","additionalProperties":true}` — so the smallest one with substantive
content is shown instead.

**Smallest gate schema** — `schemas/forbidden_change_scan_schema.json` (the shape every entry in
extract 3's `forbidden_change_scan` must satisfy):

```json
{
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "required": [
      "value",
      "status",
      "verification_method"
    ]
  }
}
```

**Mid-sized artifact schema** — `schemas/phase_completion_matrix_schema.json` (the artifact
checked by `_complete_phase_matrix` in extract 5; shows naming, required fields, status enums):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "phase_completion_matrix",
  "type": "object",
  "required": [
    "phase_2",
    "phase_4"
  ],
  "properties": {
    "phase_2": {
      "type": "object",
      "required": [
        "2A_assessment_contract",
        "2B_worked_solution_blueprint",
        "2C_student_facing_draft",
        "2D_pre_code_pedagogy_audit"
      ],
      "additionalProperties": {
        "enum": [
          "COMPLETE",
          "NOT_RUN",
          "BLOCKED"
        ]
      }
    },
    "phase_4": {
      "type": "object",
      "required": [
        "4A_semantic_flow",
        "4B_portal_control",
        "4C_math_enumeration",
        "4D_pedagogy_source_fidelity",
        "4E_render_format_diagnostic",
        "4F_inventory_scoring"
      ],
      "additionalProperties": {
        "enum": [
          "COMPLETE",
          "NOT_RUN",
          "BLOCKED"
        ]
      }
    }
  },
  "additionalProperties": true
}
```

Also worth copying (referenced by extract 1's self-check) — `schemas/package_validation_report_schema.json`:

```json
{
  "type": "object",
  "required": [
    "profile",
    "status",
    "checks",
    "artifact_hashes",
    "ready_for_human_review",
    "problems"
  ],
  "properties": {
    "status": {
      "enum": [
        "PASS",
        "FAIL"
      ]
    },
    "checks": {
      "type": "object"
    },
    "artifact_hashes": {
      "type": "object"
    },
    "ready_for_human_review": {
      "type": "boolean"
    },
    "problems": {
      "type": "array"
    }
  },
  "additionalProperties": true
}
```
