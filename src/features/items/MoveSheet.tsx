import type { SealedItem } from '../../api/types';

import { Box } from '@mui/material';
import { useState } from 'react';

import { Stepper } from '../../components/form';
import { SaveButton } from '../../components/SaveButton';
import { CancelButton, Field, Sheet } from '../../components/Sheet';
import { useMoveSealed } from '../../hooks/mutations';
import { useSaveSession } from '../../hooks/useSaveSession';
import { tokens } from '../../theme/tokens';

interface Props {
  item: SealedItem | null;
  currentShortHoldName: string | null;
  /** "Sealed" when sealed isn't split into short and long holds. */
  longHoldName: string;
  onClose: () => void;
}

export function MoveSheet({ item, currentShortHoldName, longHoldName, onClose }: Props) {
  const session = useSaveSession();
  const move = useMoveSealed();
  const [shown, setShown] = useState<SealedItem | null>(item);
  const [quantity, setQuantity] = useState(1);

  if (item && item !== shown) {
    setShown(item);
    setQuantity(item.quantity);
    session.reset();
  }

  const fromLong = shown?.holdStatus === 'long';
  const destination = fromLong ? (currentShortHoldName ?? 'Current Short Hold') : longHoldName;

  function submit() {
    if (!item) return;
    const vars = { id: item.id, quantity };
    move.mutate({ requestId: session.idFor(vars), ...vars }, { onSuccess: onClose });
  }

  return (
    <Sheet
      open={item != null}
      onClose={onClose}
      title="Move Item"
      subtitle={shown && `${shown.name} — currently in ${shown.holdName}`}
      footer={
        <>
          <CancelButton onClick={onClose} />
          <SaveButton
            pending={move.isPending}
            label="Move"
            pendingLabel="Moving…"
            onClick={submit}
            sx={{ py: 1.5, fontSize: 15 }}
          />
        </>
      }
    >
      <Field label="Quantity to Move">
        <Stepper
          value={quantity}
          min={1}
          max={shown?.quantity ?? 1}
          onChange={setQuantity}
          ariaLabel="quantity to move"
        />
      </Field>
      <Box sx={{ fontSize: 13, color: tokens.gold }}>Moving to: {destination}</Box>
    </Sheet>
  );
}
