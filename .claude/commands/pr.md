---
allowed-tools: Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(git diff:*), Bash(git log:*), Bash(gh pr create:*)
description: Commit changes, push to GitHub, and create a pull request
argument-hint: [optional: PR title]
---

## Push to GitHub and Create PR

### Instructions

1. First, check the current git status to see what changes exist
2. Review the staged and unstaged changes using git diff
3. Get the current branch name
4. Check recent commits for commit message style reference
5. Stage all relevant changes (excluding secrets/env files)
6. Create a well-formatted commit message that:
   - Summarizes the changes concisely
   - Follows conventional commit format if appropriate
   - Ends with the Claude Code signature
7. Push the branch to origin
8. Create a pull request using `gh pr create` with:
   - A clear title (use $ARGUMENTS if provided, otherwise derive from changes)
   - A summary section with bullet points
   - A test plan section

### Commit Message Format

```
Brief description of changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### PR Body Format

```
## Summary
- Bullet point 1
- Bullet point 2

## Test plan
- [ ] Testing step 1
- [ ] Testing step 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

If a PR title is provided as an argument, use: $ARGUMENTS
