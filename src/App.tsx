import type { ReactNode } from 'react';
import type { Sections } from './api/types';

import { Navigate, Route, Routes } from 'react-router';

import { AppShell } from './components/AppShell';
import { visibleTabs } from './components/tabs';
import { AccountsPage } from './features/accounts/AccountsPage';
import { ChangePasswordPage } from './features/auth/ChangePasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { RequireAuth } from './features/auth/RequireAuth';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { PrivacyPage } from './features/privacy/PrivacyPage';
import { SealedPage } from './features/sealed/SealedPage';
import { SinglesPage } from './features/singles/SinglesPage';
import { SummaryPage } from './features/summary/SummaryPage';
import { useSections } from './hooks/queries';

/** Opens on the user's first tab (Singles, or Sealed for sealed-only collectors). */
function FirstTab() {
  return <Navigate to={visibleTabs(useSections())[0]?.path ?? '/summary'} replace />;
}

/** A tab the user has turned off goes to their first tab instead. */
function OnlyIf({ section, page }: { section: keyof Sections; page: ReactNode }) {
  const sections = useSections();

  return sections[section] ? page : <FirstTab />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
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
        <Route index element={<FirstTab />} />
        <Route path="/singles" element={<OnlyIf section="tracksSingles" page={<SinglesPage />} />} />
        <Route path="/sealed" element={<OnlyIf section="tracksSealed" page={<SealedPage />} />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/accounts" element={<OnlyIf section="usesAccounts" page={<AccountsPage />} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
