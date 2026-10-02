import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export type LogoutButtonProps = Omit<ButtonProps, "type" | "loading">;

/**
 * Logout as a plain HTML form (works without JavaScript). Posts to the
 * /abmelden route handler, which destroys the session and redirects home.
 * Usable from Server and Client Components alike.
 */
export function LogoutButton({ variant = "ghost", children = "Abmelden", className, ...props }: LogoutButtonProps) {
  return (
    <form method="post" action="/abmelden" className="contents">
      <Button type="submit" variant={variant} className={className} {...props}>
        {children}
      </Button>
    </form>
  );
}
