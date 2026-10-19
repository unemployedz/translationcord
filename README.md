# TranslationCord

Kettu plugin that adds **Translate Message** to Discord’s long-press message menu and shows an English → French translation on screen (never sent to the channel).

## What it does

When you **long-press a message** in Discord, the usual sheet appears (Reply, Forward, Report, Copy, etc.).
With this plugin enabled, that same sheet also includes:

**Translate Message**

Tap it → a screen opens with the French translation (plus loading / error states). Nothing is posted to the chat.

## Install (Kettu on iOS)

1. Open Discord with **Kettu** installed (via [KettuTweak](https://github.com/C0C0B01/KettuTweak)).
2. Go to **Settings → Plugins**.
3. Tap the **+** button.
4. Paste **exactly** this URL (keep the trailing `/`):

```
https://cdn.jsdelivr.net/gh/unemployedz/translationcord@main/dist/
```

5. Install / enable **TranslationCord**.
6. Fully close Discord and reopen it (or reload if Kettu offers that).
7. Open any chat → **long-press** a message that has English text → look for **Translate Message** in the menu.

### Why the “raw.githubusercontent.com/…/dist/” link looked broken

Opening a **folder** URL in a browser shows “Not Found”. That is normal.
Kettu does not open the folder in a browser; it requests:

- `…/dist/manifest.json`
- `…/dist/index.js`

Those files are public and work. Prefer the **jsDelivr** URL above; it is more reliable on mobile.

Alternate (same files):

```
https://raw.githubusercontent.com/unemployedz/translationcord/main/dist/
```

## GitHub Pages (optional)

You do **not** need Pages if you use the jsDelivr URL. If you still want Pages:

1. Open the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → Save.
4. After a minute, copy `dist/manifest.json` and `dist/index.js` to the repo root *or* use:
   `https://unemployedz.github.io/translationcord/dist/`
   (only works after Pages is enabled and the site is live).

## Privacy

- Does not read or store your Discord token.
- Does not log message history.
- Sends only the selected message’s text to a translation provider (Google gtx, then MyMemory).

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| Plugin won’t install | Use the jsDelivr URL with the trailing `/`. Confirm the plugin is enabled. |
| No “Translate Message” | Reload Discord after enabling. Long-press the message bubble, not the avatar. |
| Translation errors | Network/rate limits on free providers; try again later or with shorter text. |
| Empty result | Message has no plain text (only embed/attachment). |

## Source

- Plugin source: `plugins/TranslationCord/`
- Installable bundle: `dist/` (`manifest.json` + `index.js`)

## License

MIT
