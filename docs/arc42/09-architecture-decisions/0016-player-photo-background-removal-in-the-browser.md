# 0016. Player photos: background removed in the editor's browser, all files self-hosted

- Status: accepted
- Date: 2026-10-12

## Context

The squad photos are cut-outs: transparent background, head and shoulders, 720 px tall. The players stand on the club green on cards and profiles. The first photos were prepared by hand with `@imgly/background-removal`. Photos uploaded through the website's editor (ADR-0015) kept their background and framing, so they looked out of place.

That library is AGPL-3.0. Building it into the site would conflict with the proprietary licence (ADR-0012). Paid APIs (e.g. remove.bg) break the €0 constraint. Vercel functions on the Hobby plan have tight time and size limits for running a model on the server.

## Decision Drivers

- Every uploaded photo matches the existing ones, without manual work.
- €0, and only licences compatible with ADR-0012.
- Privacy: no third-party requests, not even from editors' browsers (`CLAUDE.md` §10).
- Visitors are unaffected: no extra code or requests on public pages.

## Considered Options

1. **MODNet (Apache-2.0) through transformers.js (Apache-2.0) in the editor's browser**, with the model and ONNX runtime served from our domain.
2. The same, but loading the model and runtime from Hugging Face and jsDelivr on first use.
3. `@imgly/background-removal`: very good results, but AGPL-3.0, or a paid commercial licence.
4. A hosted API (remove.bg and similar): costs money, and sends player photos to a third party.
5. Removing backgrounds by hand before upload.

## Decision

Chosen option 1. The president chose self-hosting over option 2.

- **The pipeline** (`features/players/components/editor/cut-out-portrait.ts`) runs when an editor picks a photo:
  1. Scale the photo to at most 2048 px.
  2. Predict a portrait matte with MODNet (quantized, 6.6 MB, about 2–5 s).
  3. Apply the matte as the alpha channel.
  4. Remove the background colour from the semi-transparent edges with F = (I − (1 − α)·B) / α, using the background colour B estimated from the removed area. This is what fixes the sky-blue halo in hair.
  5. Trim to the player, crop full-length photos to head and shoulders (height at most 1.1 × width), and scale to 720 px tall without enlarging.
  6. Encode as WebP.
- The image maths are pure functions in `domain/portrait.ts`, unit-tested.
- **Self-hosted files:**
  - the model is committed in `public/models/Xenova/modnet/`, with its licence notice;
  - the ONNX Runtime Web engine (about 28 MB, compressed in transfer) is copied from `node_modules` into `public/onnx/` by `scripts/copy-onnx-runtime.mjs` before `dev` and `build`, so it is never committed and always matches the installed version;
  - transformers.js is set to `allowRemoteModels: false` with local paths only.
- **Loading:**
  - the module loads through a dynamic `import()` only when an editor picks a photo;
  - visitors download nothing;
  - the editing UI itself is already editor-only (ADR-0015).
- **The editor stays in control:**
  - a preview on the club green;
  - "Remove background automatically" (on by default) can be switched off for a photo that is already cut out;
  - if removal fails, the photo is uploaded as it is, shrunk, and the editor is told;
  - saving waits until removal is finished.

## Consequences

- Good: new photos look like the existing squad, with no tools to learn, no cost and no third party.
- Good: the image maths are deterministic and tested; the model is swappable behind one module.
- Bad: the first photo per visit waits a few seconds for the model and runtime to load (cached afterwards). Phones with little memory may fail; the fallback keeps the editor working.
- Bad: each build serves about 35 MB of extra static files. They are editor-only and well within Vercel's limits.
- Bad: MODNet is a portrait model. Group photos or photos where the player is small may cut out poorly; the preview shows this before saving.
- New dependency: `@huggingface/transformers` (the `CLAUDE.md` §3 stack is extended by this ADR).
