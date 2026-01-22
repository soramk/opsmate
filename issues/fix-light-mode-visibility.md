# Issue: Light Mode Visibility Improvements

## Status

- [x] Fixed: OverheadCalculator light mode clashing
- [x] Fixed: RaidCalculator light mode clashing
- [x] Fixed: LogAnalyzer light mode clashing
- [x] Fixed: ShiftGenerator light mode clashing
- [x] Fixed: JsonDiff light mode clashing
- [x] Fixed: PostMortemGen light mode clashing
- [x] Fixed: PermissionWizard light mode clashing
- [x] Fixed: NetTroubleshoot light mode clashing
- [x] Fixed: SystemHelper light mode clashing
- [x] Added: Theme-aware `.code-output` and `.code-textarea` classes in `style.css`

## Summary

Updated all newly added tools to use theme-aware CSS variables instead of hardcoded dark-mode colors. This ensures that text remains readable and backgrounds adapt correctly when the user switches to light mode.

## Details

- Replaced `bg-slate-900`, `bg-slate-800` etc. with `var(--bg-primary)`, `var(--bg-secondary)`.
- Replaced `text-slate-400`, `text-slate-200` with `var(--text-secondary)`, `var(--text-primary)`.
- Replaced hardcoded `text-emerald-400` with `var(--accent-primary)`.
- Unified component structures to use standard `panel-card` and `result-item` where possible, or used CSS variables for custom layouts.
