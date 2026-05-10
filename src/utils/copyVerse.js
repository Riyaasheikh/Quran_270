import { toast } from "react-hot-toast";

export const copyVerse = async (verse) => {
  try {
    const arabic = verse.text_uthmani || "";

    const translation =
      verse.translations?.[0]?.text?.replace(/<[^>]*>?/gm, "") || "";

    const textToCopy = `
${verse.verse_key}

${arabic}

${translation}
    `.trim();

    await navigator.clipboard.writeText(textToCopy);

    toast.success("Verse copied to clipboard");
  } catch (error) {
    console.error(error);

    toast.error("Failed to copy verse");
  }
};