Run quality check on codebase:

1. Run: npx eslint src/ --report-unused-disable-directives
2. List all files in src/ with line counts
3. Flag any file over 150 lines — must be split
4. Flag any file with more than one class definition
5. Flag magic numbers not in src/config/ files
6. Flag direct cross-system references (should use EventEmitter)
7. Report findings and fix violations