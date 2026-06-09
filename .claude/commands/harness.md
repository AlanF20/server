# /harness — Activate the SDD harness workflow

Trigger the full Repertory harness workflow for a feature request.

## Usage
```
/harness <feature description>
```

## What this does

You are now acting as the **leader agent**. Execute the full SDD protocol:

### Step 1 — Environment check
Run `./init.sh`. If it fails, stop and report the failure. Do not proceed.

### Step 2 — Read context
Read in order:
1. `progress/specs/STATUS.md` — current pipeline state
2. `feature_list.json` — existing features and their statuses
3. `progress/current.md` — active session state

### Step 3 — Classify the request: "$ARGUMENTS"

**Is this an existing feature?**
- If yes: find it in `feature_list.json` by matching title/name
- If no: it will become a new feature (assign the next available id)

**Is the request clear enough to write a spec without questions?**

A request is clear if ALL of the following are known:
- Who the user is (role: leader / member / unauthenticated)
- What data goes in and what comes out
- What the error cases are (named specifically)
- Whether a DB migration is needed
- What is explicitly out of scope

**If vague** → launch `investigator` subagent:
> "The feature request is: '$ARGUMENTS'. Investigate this request using Mode A (interrogation). Read the existing codebase context in `server/src/`, `shared/src/`, and `feature_list.json` to understand what already exists. Write your questions to `progress/specs/questions_<slug>.md`. Reply: `questions -> progress/specs/questions_<slug>.md`"

Then present the questions to the user and wait for answers before continuing.

**If clear** → go directly to Step 4.

### Step 4 — Write the spec

Launch `spec-writer` subagent:
> "Write a complete spec for: '$ARGUMENTS'. [Include answered questions if investigator ran]. Read `docs/architecture.md`, `docs/conventions.md`, and the relevant source files first. Use the template at `progress/specs/TEMPLATE.md`. Write the spec to `progress/specs/feat-NNN-<slug>.md`. Update `feature_list.json` and `progress/specs/STATUS.md`. Reply: `spec_ready -> progress/specs/feat-NNN-<slug>.md`"

### Step 5 — Gate check

Read the spec file. Confirm:
- `status: spec_ready` in YAML frontmatter
- Open Questions section is empty
- All ACs are Given/When/Then with concrete data

If not → go back to investigator.

### Step 6 — Implement

Update `progress/current.md` with the session state.

Launch `implementer` subagent:
> "Implement feature <id> — <name>. The spec is at `progress/specs/feat-NNN-<slug>.md`. Read it fully before writing any code. Follow `docs/conventions.md`. Write tests for every AC. Run `./init.sh` before marking done. Write your report to `progress/impl_<feature_name>.md`. Reply: `done -> progress/impl_<feature_name>.md` or `blocked -> see progress/current.md`"

### Step 7 — Review

Launch `reviewer` subagent:
> "Review the implementation of feature <id>. Spec: `progress/specs/feat-NNN-<slug>.md`. Implementation report: `progress/impl_<feature_name>.md`. Read `CHECKPOINTS.md` and run `./init.sh`. Verify every AC from the spec. Write verdict to `progress/review_<feature_name>.md`. Reply: `APPROVED -> ...` or `CHANGES_REQUESTED -> ...`"

### Step 8 — Close session

If APPROVED:
- Set feature status → `done` in `feature_list.json` and `progress/specs/STATUS.md`
- Set `verification_passed: true`
- Append to `progress/history.md`
- Reset `progress/current.md` to the empty template

If CHANGES_REQUESTED:
- Set feature status → `in_progress`
- Document blocker in `progress/current.md`
- Re-launch implementer with the reviewer's feedback

## Anti-telephone rule
Every subagent writes results to a file. You only accept one-line references in reply. Never accept code or diffs in chat.
