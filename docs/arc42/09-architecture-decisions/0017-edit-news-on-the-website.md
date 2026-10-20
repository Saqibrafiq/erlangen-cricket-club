# 0017. Edit news on the website with a visual Lexical editor

- Status: accepted
- Date: 2026-10-20

## Context

After players (ADR-0015), editors want to write, publish, edit and delete news on the website. Articles differ from players in four ways:

- the text is rich text: headings, bold, lists and links, stored by Payload as Lexical JSON;
- articles have drafts;
- title, summary and text exist per language;
- an article can have a main image and a gallery of many photos.

Editors aren't technical (persona 4), so writing has to feel like a word processor.

## Decision Drivers

- What you see is what readers get, with no markup to learn.
- Articles stay 100 % compatible with Payload's admin and renderer. The website must never lose content it can't show.
- Server actions accept 4 MB per request, and a gallery can be much larger.
- The same security pattern as players: session checked per action, writes with access control on.

## Considered Options

- Text:
  1. **A visual editor on Lexical**, the engine Payload uses, with only the link node converted between the two shapes.
  2. A plain text box with Markdown-like marks, converted on save.
  3. Embedding Payload's admin rich-text field on the website.
- Images:
  1. **Upload each image when it is chosen**, then save the article with the image ids.
  2. Send all images together with the article.

## Decision

Option 1 for both; the president chose the visual editor.

- **`shared/ui/RichTextEditor`** (Lexical 0.50.0, the version Payload ships, added as direct dependencies):
  - a toolbar for text style (text, heading, subheading), bold, italic, bulleted and numbered lists, links, undo and redo;
  - keyboard shortcuts as in any word processor;
  - link addresses accepted only for `https://`, site paths and `mailto:`; external links open in a new tab;
  - after a link is added, the cursor moves past it, so the next keystroke can't replace the linked word.
- **`features/news/domain/rich-text.ts`:**
  - converts links between Payload's shape (`fields: { url, newTab, linkType }`) and Lexical's (`url`, `target`, `rel`); all other nodes are already identical;
  - `isEditableOnWebsite` lists the node types the website editor understands. An article containing anything else (e.g. an upload or block added in the admin) keeps its text read-only on the website and is saved without its text field, so nothing is lost.
  - The server accepts only text the website editor can produce.
- **Drafts:**
  - "Publish" / "Save as draft" (or "Save" / "Unpublish" for a published article);
  - drafts are listed for editors only;
  - editors load the newest version (`draft: true`).
- **Languages:**
  - a new article is written to every locale, so it appears on both language versions of the site;
  - later edits change the language being edited, and the form says which one.
- **URLs** are set from the title when an article is created and then stay the same, so shared links keep working. A duplicate title is reported on the title field.
- **Images:**
  - each image is shrunk in the browser and uploaded on its own (`uploadNewsImageAction`); the article references the ids;
  - deleting an article, or removing an image from it, leaves the image in the media library, because it may be used elsewhere (e.g. the journey page reuses news photos).
- **Composition:**
  - a client `NewsEditingProvider` wraps the server-rendered list or article and adds the toolbar and notices;
  - one lazily loaded `NewsEditor` is opened by each article's `NewsEditActions`;
  - visitors render only the children.
- `EditActions` and `EditorToolbar` moved to `shared/ui` and are now used by players and news.

## Consequences

- Good: editors write formatted articles on the website in both languages, with drafts, and Payload's admin still reads and edits every article.
- Good: the visual editor is generic and ready for other rich text (e.g. sponsors, the journey page).
- Bad: articles with admin-only content can't have their text edited on the website (other fields can).
- Bad: images that are no longer used stay in the media library (TD-14); the admin can delete them.
- Bad: translating means switching the site language and editing again. There is no side-by-side view.
