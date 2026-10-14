import { TextField } from '@mui/material';
import { useState } from 'react';

import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useNotify } from '../../components/notifyContext';
import { useDeleteMyAccount } from '../../hooks/mutations';
import { useAuth } from './authContext';

export function DeleteAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signOut } = useAuth();
  const notify = useNotify();
  const remove = useDeleteMyAccount();
  const [typed, setTyped] = useState('');
  const [finishing, setFinishing] = useState(false);

  function close() {
    setTyped('');
    onClose();
  }

  async function confirm() {
    try {
      await remove.mutateAsync();
    } catch (err) {
      notify(`Failed — ${err instanceof Error ? err.message : String(err)}`, 'error');

      return;
    }
    setFinishing(true);
    await signOut();
    notify('Your account was deleted', 'success');
  }

  return (
    <ConfirmDialog
      open={open}
      title="Delete your account?"
      message="This permanently deletes your login and everything in your collection: singles, sealed items, holds, sales and accounts. It can't be undone."
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      confirmDisabled={typed.trim().toUpperCase() !== 'DELETE'}
      pending={remove.isPending || finishing}
      onConfirm={confirm}
      onCancel={close}
    >
      <TextField
        label="Type DELETE to confirm"
        autoComplete="off"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        fullWidth
        slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
        sx={{ mb: 2.5 }}
      />
    </ConfirmDialog>
  );
}
