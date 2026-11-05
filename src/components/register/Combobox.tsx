"use client";

import { useId, useState, type KeyboardEvent } from "react";

function rank(options: readonly string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [...options];
  const prefix = options.filter((o) => o.toLowerCase().startsWith(q));
  const inside = options.filter((o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q));
  return [...prefix, ...inside];
}

/**
 * Text input with suggestions: typing "toy" shows the rest of "Toyota" inline, and Enter, Tab or a click
 * completes it. Values that are not on the list are still accepted.
 */
export function Combobox({
  id,
  value,
  options,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  invalid = false,
  describedBy,
  inputMode,
  required = false,
}: {
  id: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  inputMode?: "text" | "numeric";
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const matches = rank(options, value);
  const showList = open && matches.length > 0 && !disabled;
  const top = matches[0];
  const typed = value.trim().toLowerCase();
  // The rest of the best match, shown faintly after what was typed.
  const ghost =
    open && typed && top?.toLowerCase().startsWith(value.toLowerCase()) && top.length > value.length
      ? top.slice(value.length)
      : "";

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const handleBlur = () => {
    setOpen(false);
    if (typed) {
      // Tidy the value: fix its case, or finish it when only one option can match.
      const exact = options.find((o) => o.toLowerCase() === typed);
      const candidates = options.filter((o) => o.toLowerCase().startsWith(typed));
      if (exact) {
        if (exact !== value) onChange(exact);
      } else if (candidates.length === 1) onChange(candidates[0]);
    }
    onBlur?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      if (matches.length) setActive((active + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length);
    } else if (e.key === "Enter" && showList && (typed || active > 0)) {
      e.preventDefault();
      choose(matches[active] ?? top);
    } else if (e.key === "Tab" && showList && (ghost || active > 0)) {
      // Tab accepts only what is visibly suggested, so custom values are not overwritten.
      choose(matches[active] ?? top);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {ghost && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex h-14 items-center overflow-hidden whitespace-pre px-4 text-base">
          <span className="invisible">{value}</span>
          <span className="text-faint">{ghost}</span>
        </span>
      )}
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="both"
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        autoComplete="off"
        inputMode={inputMode}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => {
          setActive(0);
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`relative h-14 w-full rounded-2xl border bg-transparent px-4 text-base outline-none transition placeholder:text-faint focus:border-ink disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60 ${
          invalid ? "border-danger" : "border-line"
        }`}
      />
      <ul
        id={listId}
        role="listbox"
        hidden={!showList}
        className="absolute inset-x-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-ink/10"
      >
        {showList &&
          matches.map((option, i) => {
            const at = option.toLowerCase().indexOf(typed);
            return (
              <li
                key={option}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // Keeps focus in the input so the click lands before blur closes the list.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(option)}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm ${i === active ? "bg-brand-tint" : ""}`}
              >
                {typed && at >= 0 ? (
                  <>
                    {option.slice(0, at)}
                    <strong className="font-bold">{option.slice(at, at + typed.length)}</strong>
                    {option.slice(at + typed.length)}
                  </>
                ) : (
                  option
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
