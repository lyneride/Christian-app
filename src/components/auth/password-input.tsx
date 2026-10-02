"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/** Password field with a show/hide toggle. Forwards every input prop (name, id, autoComplete, aria-*, …). */
export function PasswordInput({
  className,
  autoCapitalize = "off",
  autoCorrect = "off",
  spellCheck = false,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
        aria-pressed={visible}
        title={visible ? "Passwort verbergen" : "Passwort anzeigen"}
        className="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
