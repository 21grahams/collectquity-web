import type { ReactNode } from 'react';

import { Box, Button, Drawer } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { fonts, tokens } from '../theme/tokens';
import { sheetButtonSx } from './buttonStyles';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

const CLOSE_FRACTION = 1 / 3; // dragged this far down the sheet's height closes it
const FLICK_SPEED = 0.5; // px per ms; a quick flick closes it even if short

function useDragToClose(onClose: () => void) {
  const drag = useRef<{ paper: HTMLElement; startY: number; startTime: number; dy: number } | null>(null);

  const end = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const speed = d.dy / Math.max(1, performance.now() - d.startTime);
    d.paper.style.transition = 'transform 0.2s ease-out';
    if (d.dy > d.paper.offsetHeight * CLOSE_FRACTION || (speed > FLICK_SPEED && d.dy > 30)) {
      onClose();
    } else {
      d.paper.style.transform = 'none';
    }
  };

  return {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      const paper = e.currentTarget.closest<HTMLElement>('.MuiDrawer-paper');
      if (!paper) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      paper.style.transition = 'none';
      drag.current = { paper, startY: e.clientY, startTime: performance.now(), dy: 0 };
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d) return;
      d.dy = Math.max(0, e.clientY - d.startY);
      // MUI's slide-out keeps a `translate(x, y)` drag position instead of resetting it
      // (which flashes the sheet back to the top in Chrome).
      d.paper.style.transform = `translate(0px, ${d.dy}px)`;
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
}

export function Sheet({ open, onClose, title, subtitle, children, footer }: SheetProps) {
  // iOS scrolls the page under the sheet to make room for the keyboard and
  // never scrolls it back, so put the page back where it was on close.
  const [savedScroll, setSavedScroll] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  const [closeCount, setCloseCount] = useState(0);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSavedScroll(window.scrollY);
    else setCloseCount((n) => n + 1);
  }
  const restoreScroll = () => window.scrollTo(0, savedScroll);
  const dragHandlers = useDragToClose(onClose);

  // Restoring only after the slide-down shows the shifted page for a moment, so
  // also restore as closing starts, while the backdrop still covers it.
  useEffect(() => {
    if (closeCount === 0) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const frame = requestAnimationFrame(() => window.scrollTo(0, savedScroll));

    return () => cancelAnimationFrame(frame);
  }, [closeCount, savedScroll]);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      disableRestoreFocus
      slotProps={{
        transition: { onExited: restoreScroll },
        backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.75)' } },
        paper: {
          sx: {
            width: '100%',
            maxWidth: 600,
            mx: 'auto',
            maxHeight: '92dvh',
            borderRadius: '20px 20px 0 0',
            border: 'none',
            backgroundColor: tokens.surface,
            px: 2.5,
            pb: 'calc(24px + env(safe-area-inset-bottom))',
          },
        },
      }}
    >
      <Box {...dragHandlers} sx={{ mx: -2.5, px: 2.5, pt: 3, touchAction: 'none', cursor: 'grab' }}>
        <Box
          sx={{ width: 36, height: 4, borderRadius: 2, backgroundColor: tokens.border, mx: 'auto', mb: 2.5 }}
        />
        <Box sx={{ fontFamily: fonts.serif, fontSize: 20, color: tokens.gold, mb: subtitle ? 0.5 : 2.5 }}>
          {title}
        </Box>
        {subtitle && <Box sx={{ fontSize: 13, color: tokens.text2, mb: 2.5 }}>{subtitle}</Box>}
      </Box>
      {children}
      {footer && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 1.25,
            mt: 2.5,
            pt: 2.5,
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          {footer}
        </Box>
      )}
    </Drawer>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        mb: 1.75,
        ...(error && {
          '& input, & select, & textarea, & [data-field-box]': { borderColor: `${tokens.red} !important` },
        }),
      }}
    >
      <Box
        component="label"
        sx={{
          display: 'block',
          fontSize: 11,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: tokens.text2,
          mb: 0.75,
        }}
      >
        {label}
      </Box>
      {children}
      {error && (
        <Box role="alert" sx={{ fontSize: 11, color: tokens.red, mt: 0.5 }}>
          {error}
        </Box>
      )}
    </Box>
  );
}

export function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outlined" color="inherit" onClick={onClick} sx={{ ...sheetButtonSx, px: 2.5 }}>
      Cancel
    </Button>
  );
}
