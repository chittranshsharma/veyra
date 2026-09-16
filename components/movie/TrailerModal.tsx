"use client";

import { useEffect, useRef, useState } from "react";
import { X, Play } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

interface TrailerModalProps {
  youtubeKey: string;
  movieTitle: string;
}

export function TrailerModal({ youtubeKey, movieTitle }: TrailerModalProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={buttonVariants({ variant: "secondary", size: "lg" })}
      >
        <Play size={16} />
        Watch Trailer
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="mx-auto w-full max-w-4xl rounded-2xl bg-black p-0 backdrop:bg-black/75 open:flex open:flex-col"
        style={{ border: "none" }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="truncate text-sm font-medium text-muted">
            {movieTitle} — Trailer
          </span>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="aspect-video w-full">
          {open && (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`}
              className="h-full w-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              title="Trailer"
            />
          )}
        </div>
      </dialog>
    </>
  );
}
