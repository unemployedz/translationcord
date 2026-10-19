# TranslationCord

Kettu-compatible plugin: long-press a Discord message → **Translate Message** → view an English→French translation in a native-looking screen. The translation is **never** sent into the conversation.

## Features (v1)

- Adds **Translate Message** to the message long-press action sheet
- Translates **only** the selected message’s plain text
- Shows loading, error, empty-message, and success states
- Does not send the translation to the channel
- Does not access or export the Discord authentication token
- Sends only message text to external translation providers (no user IDs / tokens)

## Install on Kettu (iOS)

1. Install [KettuTweak](https://github.com/C0C0B01/KettuTweak) and open Discord.
2. Open **Settings → Plugins**.
3. Tap **+** and paste the plugin install URL (directory that contains `manifest.json` + `index.js`):

   ```
   https://raw.githubusercontent.com/unemployedz/translationcord/main/dist/
   ```

   If raw.githubusercontent.com is blocked on your network, host the `dist/` folder on any static HTTPS host and use that directory URL instead (must end with `/`).

4. Enable the plugin and restart Discord if needed.
5. Long-press any message with English text → **Translate Message**.

> **Note:** The repository may be private. Raw GitHub URLs require the repo to be **public**, or you must use a public static host / GitHub Pages. Making the repo public or enabling Pages is required for install without a private token.

## Privacy

- No Discord token is read or stored.
- No message history is logged by the plugin.
- Only the selected message’s text content is sent to a translation provider.
- Providers tried (in order): unofficial Google Translate (`client=gtx`), MyMemory, LibreTranslate-compatible mirrors.
- These public endpoints can rate-limit, change, or block traffic. Do not translate sensitive messages if you do not trust the provider.

## Development

Source lives under `plugins/TranslationCord/`.

- `src/index.tsx` – action-sheet patch + result UI
- `src/translate.ts` – replaceable provider chain
- `dist/` – built installable bundle (`manifest.json` + `index.js` with `hash`)

To rebuild the distribution bundle after editing source, re-bundle into a single IIFE that uses the `vendetta` runtime object (see `dist/index.js`), then update `hash` in `dist/manifest.json` to the SHA-256 of `index.js`.

## Compatibility

- Client: **Kettu** (Vendetta/Bunny-compatible plugin loader)
- Platform: Discord mobile (iOS via KettuTweak; Android loaders that use the same plugin API should work)
- Verified against Kettu’s `VdPluginManager` manifest schema (`name`, `description`, `authors`, `main`, `hash`, optional `vendetta.icon`)

## Limitations

- On-device action-sheet injection and navigation must be confirmed on a real Kettu install; APIs follow patterns used by ViewRaw / local-pins / similar plugins.
- Free translation endpoints are best-effort and may fail under rate limits.
- Embeds / attachments without plain text are reported as empty.
- Making the install URL publicly reachable requires a public repo or external static hosting.

## License

MIT
