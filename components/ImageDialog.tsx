"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { VoteOption } from "./types";

type ImageDialogProps = {
  option: VoteOption | null;
  onClose: () => void;
};

export function ImageDialog({ option, onClose }: ImageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (option && !dialog.open) {
      dialog.showModal();
    } else if (!option && dialog.open) {
      dialog.close();
    }
  }, [option]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={option ? `Imagen de ${option.title}` : "Imagen"}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="m-auto w-[min(92vw,60rem)] rounded-3xl border-0 bg-transparent p-0 text-left shadow-2xl outline-none"
    >
      {option ? (
        <div className="max-h-[90dvh] overflow-y-auto rounded-3xl bg-white">
          <div className="relative">
            <Image
              src={option.imagePath}
              alt={option.title}
              width={1200}
              height={800}
              unoptimized
              className="h-auto w-full object-cover"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar imagen"
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-stone-950/70 text-white backdrop-blur-sm transition hover:bg-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-3 p-5 sm:p-6">
            <span className="w-fit rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
              {option.tag}
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
              {option.title}
            </h2>
            <p className="text-sm leading-6 text-stone-600">
              {option.description}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
            >
              Cerrar y volver a la encuesta
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
