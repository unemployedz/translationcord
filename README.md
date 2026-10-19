# TranslationCord

A Kettu-compatible plugin project for on-demand English-to-French translation.

## Planned interaction

1. Long-press a Discord message.
2. Choose **Translate Message**.
3. View the French translation without sending a message to the channel.

## Current status

- [x] Plugin manifest scaffold
- [x] English-to-French translation request helper
- [ ] Confirm and wire Kettu's message action-sheet API
- [ ] Add a native translation result view and error/loading states
- [ ] Build the hosted plugin bundle and validate the install URL

The translation helper uses a public LibreTranslate-compatible endpoint as a prototype. Public translation endpoints can be rate-limited, unavailable, or change their policies; this is not a production endpoint guarantee. Message text sent for translation is processed by that external service, so do not translate sensitive messages unless you trust the provider.

This project does not request a Discord token and does not store message history.
