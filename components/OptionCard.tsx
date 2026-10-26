"use client";

import Image from "next/image";
import type { VoteOption } from "./types";

type OptionCardProps = {
  option: VoteOption;
  selected: boolean;
  loading?: "eager" | "lazy";
  onSelect: () => void;
  onOpenImage: () => void;
};

export function OptionCard({
  option,
  selected,
  loading,
  onSelect,
  onOpenImage,
}: OptionCardProps) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-200 ${
        selected
          ? "border-teal-700 shadow-[0_0_0_3px_rgba(15,118,110,0.14)]"
          : "border-stone-200 shadow-sm hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={onOpenImage}
        aria-label={`Ver imagen de ${option.title}`}
        aria-haspopup="dialog"
        className="relative block aspect-[4/3] w-full overflow-hidden bg-stone-100"
      >
        <Image
          src={option.imagePath}
          alt={option.title}
          fill
          unoptimized
          loading={loading}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-full bg-stone-950/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
          </svg>
          Ver imagen
        </span>
      </button>

      <label className="flex flex-1 cursor-pointer flex-col gap-3 p-5">
        <input
          type="radio"
          name="optionId"
          value={option.id}
          checked={selected}
          onChange={onSelect}
          className="sr-only"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
            {option.tag}
          </span>
          <span
            aria-hidden="true"
            className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition ${
              selected
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-stone-300 bg-white text-transparent"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </span>
        </div>

        <span className="text-lg font-semibold leading-tight text-stone-900">
          {option.title}
        </span>
        <span className="text-sm leading-6 text-stone-600">
          {option.description}
        </span>
      </label>
    </div>
  );
}
