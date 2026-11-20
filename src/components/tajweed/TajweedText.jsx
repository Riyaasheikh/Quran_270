import React from "react";

const RULES = {
  ghunnah: { label: "Ghunnah", color: "#16a34a", bg: "#dcfce7" },
  qalqalah: { label: "Qalqalah", color: "#2563eb", bg: "#dbeafe" },
  ikhfa: { label: "Ikhfa", color: "#ea580c", bg: "#ffedd5" },
  idgham: { label: "Idgham", color: "#9333ea", bg: "#f3e8ff" },
  iqlab: { label: "Iqlab", color: "#db2777", bg: "#fce7f3" },
  madd: { label: "Madd", color: "#ca8a04", bg: "#fef9c3" },
};

function getRuleForWord(word, nextWord) {
  if (!word) return null;
  if (word.includes("نّ") || word.includes("مّ")) return "ghunnah";
  if ((word.includes("نْ") || word.endsWith("ن")) && nextWord?.startsWith("ب")) return "iqlab";
  if (/[قطبجد]ْ/.test(word)) return "qalqalah";
  if (word.includes("نْ") && nextWord && /^[تثجددذرزسشصضطظفقك]/.test(nextWord)) return "ikhfa";
  if (word.includes("نْ") && nextWord && /^[يرملون]/.test(nextWord)) return "idgham";
  if (word.includes("ٓ") || word.includes("ٰ")) return "madd";
  return null;
}

export default function TajweedText({ text, enabled }) {
  if (!text) return null;
  if (!enabled) return <span>{text}</span>;

  const words = text.split(" ");
  let found = [];

  return (
    <>
      {words.map((word, i) => {
        const key = getRuleForWord(word, words[i + 1]);
        const rule = key ? RULES[key] : null;
        if (key && !found.includes(key)) found.push(key);
        return (
          <span key={i} title={rule?.label} style={{ background: rule ? rule.bg : "transparent", color: rule ? rule.color : "inherit", padding: "2px 4px", borderRadius: "6px", fontWeight: rule ? "bold" : "normal" }}>
            {word}{" "}
          </span>
        );
      })}
      {found.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px", direction: "ltr" }}>
          {found.map((r) => (
            <span key={r} style={{ background: RULES[r].bg, color: RULES[r].color, padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
              ● {RULES[r].label}
            </span>
          ))}
        </div>
      )}
    </>
  );
}