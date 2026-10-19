import { findByProps, findByName } from "@vendetta/metro";
import { React, ReactNative } from "@vendetta/metro/common";
import { before, after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import { translateEnglishToFrench } from "./translate";

const { View, Text, ScrollView, ActivityIndicator, StyleSheet } = ReactNative;

const ActionSheet = findByProps("openLazy", "hideActionSheet");
const ActionSheetRowModule = findByProps("ActionSheetRow");
const ActionSheetRow = ActionSheetRowModule?.ActionSheetRow;
const Navigation =
  findByProps("push", "pushLazy", "pop") ??
  findByProps("push", "pop");
const modalCloseButton =
  findByProps("getRenderCloseButton")?.getRenderCloseButton ??
  findByProps("getHeaderCloseButton")?.getHeaderCloseButton;
const Navigator =
  findByName("Navigator") ?? findByProps("Navigator")?.Navigator;

const MENU_LABEL = "Translate Message";
const MENU_ID = "translationcord-translate";

type MessageLike = {
  content?: string;
  id?: string;
  channel_id?: string;
};

function extractMessageText(message: MessageLike | null | undefined): string {
  if (!message) return "";
  const content = typeof message.content === "string" ? message.content : "";
  return content.trim();
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 13, opacity: 0.7, marginBottom: 6 },
  body: { fontSize: 16, lineHeight: 22 },
  section: { marginBottom: 20 },
  error: { color: "#f23f43", fontSize: 15, lineHeight: 21 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});

function TranslationResultScreen({ message }: { message: MessageLike }) {
  const [status, setStatus] = React.useState<
    "loading" | "success" | "error" | "empty"
  >("loading");
  const [translated, setTranslated] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const original = extractMessageText(message);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!original) {
        if (!cancelled) {
          setStatus("empty");
          setErrorMsg(
            "This message has no plain text to translate (empty, embed-only, or attachment-only)."
          );
        }
        return;
      }
      setStatus("loading");
      const result = await translateEnglishToFrench(original);
      if (cancelled) return;
      if (result.ok) {
        setTranslated(result.text);
        setStatus("success");
      } else {
        setErrorMsg(result.error);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [original]);

  if (status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={[styles.label, { marginTop: 12 }]}>Translating to French…</Text>
      </View>
    );
  }

  if (status === "empty" || status === "error") {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.error}>{errorMsg}</Text>
        </View>
        {original ? (
          <View style={styles.section}>
            <Text style={styles.label}>Original (English)</Text>
            <Text style={styles.body} selectable>{original}</Text>
          </View>
        ) : null}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>French translation</Text>
        <Text style={styles.body} selectable>{translated}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Original (English)</Text>
        <Text style={styles.body} selectable>{original}</Text>
      </View>
    </ScrollView>
  );
}

function openTranslationView(message: MessageLike) {
  if (!Navigator || !Navigation) {
    (async () => {
      const text = extractMessageText(message);
      if (!text) {
        showToast("No text to translate");
        return;
      }
      showToast("Translating…");
      const result = await translateEnglishToFrench(text);
      if (result.ok) {
        showToast(result.text.slice(0, 120) + (result.text.length > 120 ? "…" : ""));
      } else {
        showToast(result.error.slice(0, 140));
      }
    })();
    return;
  }

  const screen = () => (
    <Navigator
      initialRouteName="TranslationCordResult"
      goBackOnBackPress
      screens={{
        TranslationCordResult: {
          title: "Translation",
          headerLeft: modalCloseButton
            ? modalCloseButton(() => Navigation.pop())
            : undefined,
          render: () => <TranslationResultScreen message={message} />,
        },
      }}
    />
  );

  try {
    ActionSheet?.hideActionSheet?.();
  } catch (_) {}
  Navigation.push(screen);
}

function injectMenuItem(buttons: any[], message: MessageLike) {
  if (!Array.isArray(buttons)) return;
  if (
    buttons.some(
      (b) =>
        b?.props?.label === MENU_LABEL ||
        b?.key === MENU_ID ||
        b?.props?.["data-id"] === MENU_ID
    )
  ) {
    return;
  }

  const iconSource =
    getAssetIDByName("ic_language") ??
    getAssetIDByName("LanguageIcon") ??
    getAssetIDByName("ChatIcon");

  const onPress = () => openTranslationView(message);

  if (ActionSheetRow) {
    buttons.push(
      <ActionSheetRow
        key={MENU_ID}
        label={MENU_LABEL}
        icon={
          iconSource ? (
            <ActionSheetRow.Icon source={iconSource} />
          ) : undefined
        }
        onPress={onPress}
      />
    );
  } else {
    const ButtonRow = findByProps("ButtonRow")?.ButtonRow;
    if (ButtonRow) {
      buttons.push(
        <ButtonRow key={MENU_ID} label={MENU_LABEL} onPress={onPress} />
      );
    }
  }
}

let unpatchOpenLazy: (() => void) | undefined;

function patchActionSheet() {
  if (!ActionSheet?.openLazy) {
    console.warn("[TranslationCord] ActionSheet.openLazy not found");
    return;
  }

  unpatchOpenLazy = before("openLazy", ActionSheet, ([component, key, msg]) => {
    const message = msg?.message as MessageLike | undefined;
    if (key !== "MessageLongPressActionSheet" || !message) return;

    component.then((instance: any) => {
      const unpatchInner = after("default", instance, (_args: any, component: any) => {
        React.useEffect(() => () => unpatchInner(), []);

        const buttons =
          findInReactTree(
            component,
            (c: any) =>
              Array.isArray(c) &&
              c.some(
                (child: any) =>
                  child?.type?.name === "ButtonRow" ||
                  child?.type?.name === "ActionSheetRow"
              )
          ) ??
          findInReactTree(
            component,
            (c: any) =>
              Array.isArray(c) &&
              c.some(
                (child: any) =>
                  typeof child?.props?.onPress === "function" &&
                  (child?.props?.label || child?.props?.title)
              )
          );

        if (!buttons) return;
        injectMenuItem(buttons, message);
      });
    });
  });
}

export default {
  onLoad() {
    storage.targetLanguage ??= "fr";
    storage.sourceLanguage ??= "en";
    patchActionSheet();
  },
  onUnload() {
    unpatchOpenLazy?.();
    unpatchOpenLazy = undefined;
  },
};
