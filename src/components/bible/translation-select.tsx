"use client";

import { useRouter } from "next/navigation";
import type { TranslationOption } from "@/lib/bible/ui";
import { SelectField } from "./select-field";

interface Props {
  id: string;
  label: string;
  hideLabel?: boolean;
  translations: TranslationOption[];
  /** currently selected id (null = none) */
  value: string | null;
  /** which query parameter this select controls */
  param: "t" | "p";
  /** current pathname, the other query params are preserved */
  pathname: string;
  query: Record<string, string | undefined | null>;
  /** offer an empty option with this label (used for the parallel translation) */
  noneLabel?: string;
  /** hide this id (e.g. the primary translation in the parallel select) */
  exclude?: string | null;
  className?: string;
}

const LANGUAGE_LABELS = { de: "Deutsch", en: "Englisch" } as const;

/** <select> that navigates to the same page with a changed `t` or `p` query parameter. */
export function TranslationSelect({
  id,
  label,
  hideLabel,
  translations,
  value,
  param,
  pathname,
  query,
  noneLabel,
  exclude,
  className,
}: Props) {
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) q.set(k, v);
    if (next) q.set(param, next);
    else q.delete(param);
    // A parallel view of the same translation twice makes no sense.
    if (param === "t" && q.get("p") === next) q.delete("p");
    const s = q.toString();
    router.push(`${pathname}${s ? `?${s}` : ""}`);
  }

  const visible = translations.filter((t) => t.id !== exclude);
  const languages = (["de", "en"] as const).filter((lang) => visible.some((t) => t.language === lang));

  return (
    <SelectField
      id={id}
      label={label}
      hideLabel={hideLabel}
      value={value ?? ""}
      onChange={onChange}
      className={className}
    >
      {noneLabel ? <option value="">{noneLabel}</option> : null}
      {languages.map((lang) => (
        <optgroup key={lang} label={LANGUAGE_LABELS[lang]}>
          {visible
            .filter((t) => t.language === lang)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortName}
              </option>
            ))}
        </optgroup>
      ))}
    </SelectField>
  );
}
