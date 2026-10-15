import { Box } from '@mui/material';
import { useState } from 'react';

import { greenButtonSx } from '../../components/buttonStyles';
import { FieldRow, MoneyInput, ProfitDisplay, Select } from '../../components/form';
import { SaveButton } from '../../components/SaveButton';
import { CancelButton, Field, Sheet } from '../../components/Sheet';
import { useSellLongHoldItem, useSellSingle } from '../../hooks/mutations';
import { useSections } from '../../hooks/queries';
import { useSaveSession } from '../../hooks/useSaveSession';
import { formatMoney } from '../../lib/format';
import { partialSaleNote, profitFor, validateSale } from '../../lib/sellForm';
import { tokens } from '../../theme/tokens';

export interface SellTarget {
  kind: 'single' | 'sealed';
  id: number;
  name: string;
  quantity: number;
  unitCost: number;
}

export function SellSheet({ target, onClose }: { target: SellTarget | null; onClose: () => void }) {
  const session = useSaveSession();
  const sellSingle = useSellSingle();
  const sellLongHold = useSellLongHoldItem();
  const [shown, setShown] = useState<SellTarget | null>(target);
  const [quantity, setQuantity] = useState(1);
  const [soldPrice, setSoldPrice] = useState('');
  const [attempted, setAttempted] = useState(false);

  if (target && target !== shown) {
    setShown(target);
    setQuantity(target.quantity);
    setSoldPrice('');
    setAttempted(false);
    session.reset();
  }

  const { splitsSealed } = useSections();
  const listName = shown?.kind === 'single' ? 'Singles' : splitsSealed ? 'Long Hold' : 'Sealed';

  const profit = profitFor(soldPrice, (shown?.unitCost ?? 0) * quantity);
  const validation = validateSale(soldPrice, quantity, shown?.quantity ?? 0, shown?.unitCost ?? 0);
  const errors = 'errors' in validation ? validation.errors : {};
  const shownErrors = attempted ? errors : {};

  function submit() {
    if (!target) return;
    if ('errors' in validation) {
      setAttempted(true);

      return;
    }
    const vars = { id: target.id, quantity, ...validation };
    const mutation = target.kind === 'single' ? sellSingle : sellLongHold;
    mutation.mutate({ requestId: session.idFor(vars), ...vars }, { onSuccess: onClose });
  }

  return (
    <Sheet
      open={target != null}
      onClose={onClose}
      title="Mark as Sold"
      subtitle={
        shown && (
          <>
            {shown.name}
            <Box sx={{ fontSize: 12, color: tokens.text3, mt: 0.5 }}>
              Cost {formatMoney(shown.unitCost)} each · {formatMoney(shown.unitCost * quantity)} for{' '}
              {quantity}
            </Box>
          </>
        )
      }
      footer={
        <>
          <CancelButton onClick={onClose} />
          <SaveButton
            invalid={'errors' in validation}
            pending={sellSingle.isPending || sellLongHold.isPending}
            label="Mark Sold"
            pendingLabel="Marking Sold…"
            onClick={submit}
            sx={greenButtonSx}
          />
        </>
      }
    >
      <FieldRow columns="72px 1fr 1fr">
        <Field label="Qty" error={shownErrors.quantity}>
          <Select
            aria-label="quantity sold"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ textAlign: 'center', textAlignLast: 'center' }}
          >
            {Array.from({ length: shown?.quantity ?? 1 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sold Price" error={shownErrors.soldPrice}>
          <MoneyInput value={soldPrice} onChange={(e) => setSoldPrice(e.target.value)} />
        </Field>
        <Field label="Profit">
          <ProfitDisplay profit={profit} />
        </Field>
      </FieldRow>
      {shown && (
        <Box sx={{ fontSize: 11, color: tokens.text3 }}>
          {partialSaleNote(shown.quantity, quantity, listName)}
        </Box>
      )}
    </Sheet>
  );
}
