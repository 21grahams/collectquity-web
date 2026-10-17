import { useState } from 'react';

import { MoneyInput } from '../../components/form';
import { SaveButton } from '../../components/SaveButton';
import { CancelButton, Field, Sheet } from '../../components/Sheet';
import { useSetQuarterPrice } from '../../hooks/mutations';
import { useSaveSession } from '../../hooks/useSaveSession';
import { marketLabel, toInputText } from '../../lib/itemForm';

export interface QuarterTarget {
  item: { singleId: number } | { sealedItemId: number };
  name: string;
  quarter: 1 | 2 | 3 | 4;
  quantity: number;
  unitValue: number | null;
}

export function QuarterSheet({ target, onClose }: { target: QuarterTarget | null; onClose: () => void }) {
  const session = useSaveSession();
  const setQuarter = useSetQuarterPrice();
  const [shown, setShown] = useState<QuarterTarget | null>(target);
  const [value, setValue] = useState('');
  const [initialText, setInitialText] = useState('');
  const [attempted, setAttempted] = useState(false);

  if (target && target !== shown) {
    setShown(target);
    const start = target.unitValue ? toInputText(target.unitValue) : '';
    setValue(start);
    setInitialText(start);
    setAttempted(false);
    session.reset();
  }

  const unitValue = Number.parseFloat(value.replace(/[$,\s]/g, ''));
  const error = !Number.isFinite(unitValue) || unitValue < 0 ? 'Enter a value (0 clears the quarter)' : null;

  const unchanged = initialText !== '' && value.trim() === initialText;

  function submit() {
    if (!target) return;
    if (error) {
      setAttempted(true);

      return;
    }
    if (unchanged) return;
    const vars = { item: target.item, quarter: target.quarter, unitValue };
    setQuarter.mutate({ requestId: session.idFor(vars), ...vars }, { onSuccess: onClose });
  }

  return (
    <Sheet
      open={target != null}
      onClose={onClose}
      title={shown ? `Update Q${shown.quarter} Market Value` : ''}
      subtitle={shown?.name}
      footer={
        <>
          <CancelButton onClick={onClose} />
          <SaveButton
            invalid={!!error || unchanged}
            pending={setQuarter.isPending}
            label="Save"
            onClick={submit}
            sx={{ py: 1.5, fontSize: 15 }}
          />
        </>
      }
    >
      <Field label={marketLabel(shown?.quantity ?? 1)} error={attempted ? error : null}>
        <MoneyInput value={value} onChange={(e) => setValue(e.target.value)} />
      </Field>
    </Sheet>
  );
}
