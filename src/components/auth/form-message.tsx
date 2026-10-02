import { Alert } from "@/components/ui/alert";

export interface FormMessageState {
  ok?: boolean;
  message?: string;
}

/** Renders an action's `message` as an Alert: success when `ok`, otherwise an error. */
export function FormMessage({ state, className }: { state: FormMessageState | undefined; className?: string }) {
  if (!state?.message) return null;
  return (
    <Alert tone={state.ok ? "success" : "danger"} className={className}>
      {state.message}
    </Alert>
  );
}
