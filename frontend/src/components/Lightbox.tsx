// src/components/Lightbox.tsx
import React, { useEffect, KeyboardEvent } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type Photo = string | { url?: string }; // tolerant type

export interface LightboxProps {
  images: Photo[];            // list of image sources (strings or objects with .url)
  startIndex?: number;       // initial index to open at
  open: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void; // optional callback
}

const getSrc = (p: Photo) => (typeof p === 'string' ? p : p.url || '');

export const Lightbox: React.FC<LightboxProps> = ({ images, startIndex = 0, open, onClose, onIndexChange }) => {
  const [index, setIndex] = React.useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex, open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex(i => (i <= 0 ? images.length - 1 : i - 1));
  };
  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex(i => (i >= images.length - 1 ? 0 : i + 1));
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') setIndex(i => (i <= 0 ? images.length - 1 : i - 1));
    if (e.key === 'ArrowRight') setIndex(i => (i >= images.length - 1 ? 0 : i + 1));
  };

  if (!open) return null;
  if (!images || images.length === 0) return null;

  // portal target
  const root = document.getElementById('lightbox-root') || document.body;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      tabIndex={-1}
      onKeyDown={handleKey as any}
    >
      <div className="relative max-w-[95%] max-h-[95%] w-full">
        {/* Close */}
        <button
          aria-label="Close image"
          className="absolute right-2 top-2 z-[60] bg-white/90 rounded-full p-1"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <X />
        </button>

        {/* Prev */}
        {images.length > 1 && (
          <button
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-[60] bg-white/80 rounded-full p-2"
            onClick={(e) => { prev(e); }}
          >
            <ChevronLeft />
          </button>
        )}

        {/* Next */}
        {images.length > 1 && (
          <button
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-[60] bg-white/80 rounded-full p-2"
            onClick={(e) => { next(e); }}
          >
            <ChevronRight />
          </button>
        )}

        {/* Image */}
        <div className="flex items-center justify-center h-full">
          <img
            src={getSrc(images[index])}
            alt={`Preview ${index + 1}`}
            className="max-h-[85vh] max-w-full object-contain rounded-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>

        {/* Counter */}
        {images.length > 1 && (
          <div className="text-center mt-3 text-sm text-white/90">
            {index + 1} / {images.length}
          </div>
        )}
      </div>
    </div>,
    root
  );
};

export default Lightbox;
