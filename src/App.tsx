import { Navigate, Route, Routes } from 'react-router';

import { AppShell } from './components/AppShell';
import { AccountsPage } from './features/accounts/AccountsPage';
import { ChangePasswordPage } from './features/auth/ChangePasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { RequireAuth } from './features/auth/RequireAuth';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { SealedPage } from './features/sealed/SealedPage';
import { SinglesPage } from './features/singles/SinglesPage';
import { SummaryPage } from './features/summary/SummaryPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />
      <Route
        path="/password"
        element={
          <RequireAuth>
            <ChangePasswordPage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/singles" replace />} />
        <Route path="/singles" element={<SinglesPage />} />
        <Route path="/sealed" element={<SealedPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
