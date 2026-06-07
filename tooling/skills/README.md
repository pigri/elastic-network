# Vendored skills

Version-controlled mirror of Claude Code skills used for this project. The
**active** copy lives in `~/.claude/skills/` — that's the one Claude loads. Edit
there, then re-sync here (`cp -r ~/.claude/skills/<name> tooling/skills/`) to
update the tracked copy. Don't expect edits made *here* to take effect until
they're copied back to `~/.claude/skills/`.

- `gen0sec-doctrine-diagram/` — generator-driven SVG→PNG "depth map" diagrams in
  the Gen0Sec design (see `../../CLAUDE.md` → Diagram build conventions).
