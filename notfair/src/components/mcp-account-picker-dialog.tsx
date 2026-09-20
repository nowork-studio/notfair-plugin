"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  accountPickerFor,
  type AccountPickerItem,
} from "@/lib/mcp-account-pickers";

/**
 * Result of the server-side list prefetch the Connections page runs when
 * a multi-account MCP just finished OAuth (`?mcp_key=`). Passing data in
 * (instead of fetching on mount) matters: a mount-time server-action call
 * races the flash banner's URL-cleanup navigation, which can strand the
 * action's promise and leave the dialog stuck on "loading".
 */
export type AccountPickerPrefetch =
  | { ok: true; items: AccountPickerItem[] }
  | { ok: false; error: string };

type Phase =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "empty" }
  | { phase: "list"; items: AccountPickerItem[] };

/**
 * Account/property picker for multi-account MCPs (Google Ads, Meta Ads,
 * Search Console) on the Connections page. Opens automatically right
 * after OAuth when the bearer offers a real choice (fed by `prefetch`),
 * and manually from the card's "Choose …" / "Change …" affordances
 * (fetches on open — no navigation in flight then).
 *
 * Persisting goes through the same validated server actions onboarding
 * uses, so the choice lands on the `projects` row goal agents read.
 */
export function McpAccountPickerDialog({
  projectSlug,
  mcpKey,
  selectedId,
  open,
  prefetch,
  onOpenChange,
  onPicked,
}: {
  projectSlug: string;
  mcpKey: string;
  /** Currently persisted selection on the project row, if any. */
  selectedId: string | null;
  open: boolean;
  /** Server-prefetched list for the post-OAuth auto-open; consumed once. */
  prefetch?: AccountPickerPrefetch | null;
  onOpenChange: (open: boolean) => void;
  /** Fired after a selection was persisted. */
  onPicked: () => void;
}) {
  const picker = accountPickerFor(mcpKey);
  const [state, setState] = useState<Phase>({ phase: "loading" });
  const [pickingId, setPickingId] = useState<string | null>(null);
  // The prefetch belongs to the auto-open right after OAuth. Later manual
  // opens re-fetch so the list (and any transient error) is fresh.
  const prefetchConsumedRef = useRef(false);

  useEffect(() => {
    if (!open || !picker) return;
    setPickingId(null);
    if (prefetch && !prefetchConsumedRef.current) {
      prefetchConsumedRef.current = true;
      setState(
        !prefetch.ok
          ? { phase: "error", message: prefetch.error }
          : prefetch.items.length === 0
            ? { phase: "empty" }
            : { phase: "list", items: prefetch.items },
      );
      return;
    }
    setState({ phase: "loading" });
    let cancelled = false;
    (async () => {
      const r = await picker.list(projectSlug);
      if (cancelled) return;
      if (!r.ok) {
        setState({ phase: "error", message: r.error });
        return;
      }
      setState(
        r.items.length === 0
          ? { phase: "empty" }
          : { phase: "list", items: r.items },
      );
    })();
    return () => {
      cancelled = true;
    };
    // Reload only when the dialog (re)opens or targets a different MCP —
    // parent re-renders must not refetch mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mcpKey, projectSlug]);

  if (!picker) return null;

  async function onPick(item: AccountPickerItem) {
    if (!picker) return;
    setPickingId(item.id);
    try {
      const r = await picker.set(projectSlug, item.id);
      if (!r.ok) {
        toast.error(r.error);
        setPickingId(null);
        return;
      }
      toast.success(`${picker.noun} set: ${item.name}`);
      onPicked();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      setPickingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Which {picker.noun}?</DialogTitle>
          <DialogDescription>
            This workspace&rsquo;s goal agents operate on exactly one — pick
            it here. You can change it any time from this card.
          </DialogDescription>
        </DialogHeader>

        {state.phase === "loading" && (
          <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span>Loading from the MCP&hellip;</span>
          </div>
        )}

        {state.phase === "error" && (
          <div role="alert" className="space-y-2 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle
                className="size-4 text-[hsl(var(--notfair-warn))]"
                aria-hidden
              />
              <span>Couldn&rsquo;t load the list.</span>
            </div>
            <p className="text-xs text-muted-foreground">{state.message}</p>
          </div>
        )}

        {state.phase === "empty" && (
          <p className="py-2 text-sm text-muted-foreground">
            The connected user has no {picker.noun} the token can reach. Try
            reconnecting with a different account.
          </p>
        )}

        {state.phase === "list" && (
          <ul className="max-h-80 space-y-2 overflow-y-auto list-none p-0">
            {state.items.map((item) => {
              const isSelected = item.id === selectedId;
              const isPicking = pickingId === item.id;
              const isOtherPicking = pickingId !== null && !isPicking;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onPick(item)}
                    disabled={pickingId !== null}
                    aria-label={`Use ${item.name} (${item.id})`}
                    className={cn(
                      // Elevation over borders, per the design system: an
                      // inset surface + soft shadow reads as a card without
                      // drawing an outline.
                      "block w-full rounded-[10px] bg-[hsl(var(--notfair-surface-2)/0.5)] p-3 text-left shadow-[var(--notfair-shadow-sm)] transition-colors hover:bg-[hsl(var(--notfair-surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 disabled:cursor-not-allowed",
                      isOtherPicking && "opacity-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {item.name}
                          </span>
                          {isSelected && (
                            <span className="ns-tag-accent rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                              current
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground tabular-nums">
                          {picker.id_label} {item.id}
                        </p>
                      </div>
                      {isPicking ? (
                        <Loader2
                          className="size-4 shrink-0 animate-spin text-muted-foreground"
                          aria-hidden
                        />
                      ) : (
                        <ChevronRight
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
