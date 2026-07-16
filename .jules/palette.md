# Palette's Journal - Critical Learnings Only

## 2026-07-16 - Selection Mechanics in Monospace Snippets
**Learning:** Monospace code blocks (`<code>`) containing URLs (such as dynamic referral URLs) are difficult for trackpad and mobile users to cleanly select manually because standard double-clicking often excludes parameters, anchors, or trailing punctuation. While `CopyButton` is the primary mechanism, providing a secondary select-all-on-click mechanism on the code block itself bridges the gap for manual selection and drag/copy workflows, without compromising keyboard focus or screen-reader accessibility.
**Action:** Always make inline/block code components keyboard-focusable (`tabIndex={0}`) and add click/keypress handlers to select all contents (`window.getSelection().selectNodeContents`) when displaying long hashes, URLs, or command snippets.
