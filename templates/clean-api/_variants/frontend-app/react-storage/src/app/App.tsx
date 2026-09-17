import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useEffect, useState } from 'react';
import { bootstrapAuth, logout, type AuthUser } from '../core/auth/auth-session';
import { LoginPage } from '../features/auth/LoginPage';
import { ProductImagesWorkspace } from '../features/products/ProductImagesWorkspace';
import { AuthenticatedApp, type AppRouteExtension } from './AuthenticatedApp';

export function App() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => { void bootstrapAuth().then(setUser); }, []);
  if (user === undefined) return <main className="shell"><p>Restoring session…</p></main>;
  if (user === null) return <LoginPage onAuthenticated={setUser} />;

  const extensions: readonly AppRouteExtension[] = [{
    navigation: {
      label: 'Product Images',
      path: '/products/images',
      group: 'Sales',
      permission: 'products.view',
      icon: <ImageOutlinedIcon />,
    },
    element: <ProductImagesWorkspace user={user} />,
  }];

  return <AuthenticatedApp user={user} onLogout={() => void logout().finally(() => setUser(null))} onProfileUpdated={displayName => setUser(current => current ? { ...current, displayName } : current)} extensions={extensions} />;
}
