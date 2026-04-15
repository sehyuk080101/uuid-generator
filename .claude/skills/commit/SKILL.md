---
name: commit
description: Commit staged changes using conventional commit format without Co-Authored-By trailer
---

Commit Guide

## Commit Message Format

```
type: short description in English
```

## Types

| Type | When to use |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| refactor | Code restructuring without behavior change |
| chore | Build config, dependency updates, tooling |
| docs | Documentation only |
| test | Adding or modifying tests |
| infra | Docker, CI/CD, monitoring, infrastructure |

## Rules

- Message must be in English
- Use the imperative mood: "add", "remove", "fix" — not "added", "removes", "fixed"
- Keep the description short and specific
- Do NOT add a period at the end
- Do NOT add Co-Authored-By trailer

## Steps

1. Run `git diff --cached` to inspect staged changes. If nothing is staged, run `git diff` and `git status` to understand the working tree.
2. If there are unstaged changes relevant to the user's intent, stage them with `git add`.
3. Choose the correct type based on the nature of the changes.
4. Write the commit message following the format above.
5. Run `git commit -m "type: description"`.
