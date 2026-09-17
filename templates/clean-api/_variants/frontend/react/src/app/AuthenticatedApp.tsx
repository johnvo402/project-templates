import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import type { AuthUser } from '../core/auth/auth-session';
import { BusinessWorkspace } from '../features/business/BusinessWorkspace';
import { AppShell } from '../shared/components/AppShell';
import { getDefaultPath, getVisibleNavigation } from './app-navigation';

type Props = {
  user: AuthUser;
  onLogout: () => void;
  onProfileUpdated: (displayName: string) => void;
  aiPage?: ReactNode;
  productImagesPage?: ReactNode;
};

export function AuthenticatedApp({
  user,
  onLogout,
  onProfileUpdated,
  aiPage,
  productImagesPage,
}: Props) {
  const navigation = getVisibleNavigation(user, {
    ai: Boolean(aiPage),
    productImages: Boolean(productImagesPage),
  });
  const fallbackPath = getDefaultPath(navigation);

  return (
    <AppShell user={user} navigation={navigation} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Navigate to={fallbackPath} replace />} />

        {navigation
          .filter(item => item.section)
          .map(item => (
            <Route
              key={item.path}
              path={item.path}
              element={
                <BusinessWorkspace
                  user={user}
                  section={item.section!}
                  onProfileUpdated={onProfileUpdated}
                />
              }
            />
          ))}

        {productImagesPage && navigation.some(item => item.path === '/products/images') && (
          <Route path="/products/images" element={productImagesPage} />
        )}
        {aiPage && navigation.some(item => item.path === '/ai') && (
          <Route path="/ai" element={aiPage} />
        )}

        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Routes>
    </AppShell>
  );
}
