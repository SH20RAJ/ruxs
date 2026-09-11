# Development Workflow & Execution Protocol: RUXS

**Classification:** `[CONFIRMED ENGINEERING DIRECTIVE]`

---

## 1. Incremental Step Execution Loop

Every implementation task in RUXS must follow this disciplined 10-step execution cycle:

```mermaid
flowchart TD
    S1[1. Inspect Repository & Relevant Specs] --> S2[2. Review Feature Checklist]
    S2 --> S3[3. Implement Small Slice of Code]
    S3 --> S4[4. Add Validation & Error Handling]
    S4 --> S5[5. Write / Run Automated Tests]
    S5 --> S6[6. Run bun run build & Typecheck]
    S6 --> S7[7. Verify Acceptance Criteria]
    S7 --> S8[8. Tick Checklist Checkboxes]
    S8 --> S9[9. Create Focused Git Commit]
    S9 --> S10[10. Git Push & Report Status]
    S10 --> S1
```

---

## 2. Definition of Done (DoD)

A task is **NEVER** considered complete merely because a file was edited or a page renders.  
A task is **DONE** only when:
* [x] Requirements from the checklist are completely satisfied.
* [x] Schema/Database invariants are enforced.
* [x] Ingress data is validated using Zod.
* [x] Server-side authorization is verified.
* [x] Error states are handled gracefully.
* [x] Automated tests pass cleanly.
* [x] `bun run build` succeeds with zero errors.
* [x] Checklist item is ticked with commit hash.
* [x] Focused git commit is created and pushed.
