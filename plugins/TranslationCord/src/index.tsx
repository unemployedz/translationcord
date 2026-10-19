import { storage } from "@vendetta/plugin";

const TRANSLATE_ENDPOINT = "https://translate.argosopentech.com/translate";

type TranslationResponse = {
    translatedText?: string;
};

async function translateEnglishToFrench(text: string): Promise<string> {
    const response = await fetch(TRANSLATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            q: text,
            source: "en",
            target: "fr",
            format: "text",
        }),
    });

    if (!response.ok) {
        throw new Error(`Translation service returned ${response.status}`);
    }

    const result = (await response.json()) as TranslationResponse;
    if (typeof result.translatedText !== "string" || !result.translatedText.trim()) {
        throw new Error("The translation service returned no translated text.");
    }

    return result.translatedText;
}

export default {
    onLoad() {
        storage.targetLanguage ??= "fr";
        storage.sourceLanguage ??= "en";
        // The translation request is implemented first. The message action-sheet
        // hook will be wired after confirming the exact API supported by Kettu.
        // No Discord token or message history is stored by this plugin.
        void translateEnglishToFrench;
    },
    onUnload() {},
};
