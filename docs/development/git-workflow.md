# Git Workflow & Commit Rules: RUXS

**Classification:** `[CONFIRMED ENGINEERING DIRECTIVE]`

---

## 1. Commit Message Standard

Every commit must answer: **"What complete capability did this commit add?"**

### Format: Conventional Commits
```
<type>: <short imperative summary>

[optional body explaining context or verification]
```

### Allowed Types:
* `feat`: A new working capability or end-to-end slice.
* `fix`: A bug fix or invariant patch.
* `docs`: Documentation, checklist updates, or architectural ADRs.
* `refactor`: Code reorganization without changing external behavior.
* `test`: Adding or updating test suites.
* `chore`: Build configuration or dependency updates.

### Examples:
* `docs: establish ruxs product and development foundation`
* `feat: implement mobile-first ruxs application shell`
* `feat: add passwordless phone otp authentication flow`

---

## 2. The Push Protocol

After each verified step:
1. `git status` to inspect modified files.
2. `git diff` to verify clean changes.
3. `git commit -m "..."`.
4. `git push origin <branch>`.
5. Verify remote acknowledgment. Never claim a push succeeded without positive confirmation.
