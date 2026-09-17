"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AiConciergeModal } from "@/components/ai/AiConciergeModal";
import { WatchPartyModal } from "@/components/party/WatchPartyModal";
import { SpotlightSearchModal } from "@/components/search/SpotlightSearchModal";

interface ModalContextType {
  openAiModal: () => void;
  closeAiModal: () => void;
  openPartyModal: () => void;
  closePartyModal: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isPartyOpen, setIsPartyOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openAiModal = useCallback(() => {
    setIsPartyOpen(false);
    setIsSearchOpen(false);
    setIsAiOpen(true);
  }, []);

  const closeAiModal = useCallback(() => {
    setIsAiOpen(false);
  }, []);

  const openPartyModal = useCallback(() => {
    setIsAiOpen(false);
    setIsSearchOpen(false);
    setIsPartyOpen(true);
  }, []);

  const closePartyModal = useCallback(() => {
    setIsPartyOpen(false);
  }, []);

  const openSearchModal = useCallback(() => {
    setIsAiOpen(false);
    setIsPartyOpen(false);
    setIsSearchOpen(true);
  }, []);

  const closeSearchModal = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // Global hotkeys: "/" or Cmd+K / Ctrl+K opens Spotlight Search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (e.target as HTMLElement)?.isContentEditable;

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        openSearchModal();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearchModal();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearchModal]);

  return (
    <ModalContext.Provider
      value={{
        openAiModal,
        closeAiModal,
        openPartyModal,
        closePartyModal,
        openSearchModal,
        closeSearchModal,
      }}
    >
      {children}

      {/* Render modals directly into document.body to escape transformed/sticky parents */}
      {mounted &&
        createPortal(
          <div id="veyra-global-modals" className="relative z-[9999]">
            <AiConciergeModal isOpen={isAiOpen} onClose={closeAiModal} />
            <WatchPartyModal isOpen={isPartyOpen} onClose={closePartyModal} />
            <SpotlightSearchModal
              isOpen={isSearchOpen}
              onClose={closeSearchModal}
            />
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
