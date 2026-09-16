import { useState, type ReactNode } from 'react';
import { can, type AuthUser } from '../../core/auth/auth-session';
import { BusinessWorkspace } from '../business/BusinessWorkspace';
import { ProductImagesWorkspace } from '../products/ProductImagesWorkspace';
import '../products/product-images.css';

type Props = {
  user: AuthUser;
  onProfileUpdated: (displayName: string) => void;
  aiPanel?: ReactNode;
};

export function StorageBusinessWorkspace({ user, onProfileUpdated, aiPanel }: Props) {
  const canViewProductImages = can(user, 'products.view');
  const [section, setSection] = useState<'operations' | 'images'>('operations');

  return <>
    {canViewProductImages && <div className="panel storage-workspace-tabs" role="tablist" aria-label="Workspace mode">
      <button type="button" className={section === 'operations' ? 'active' : ''} onClick={() => setSection('operations')}>Operations</button>
      <button type="button" className={section === 'images' ? 'active' : ''} onClick={() => setSection('images')}>Product Images</button>
    </div>}
    {section === 'images' && canViewProductImages
      ? <ProductImagesWorkspace user={user} />
      : <BusinessWorkspace user={user} onProfileUpdated={onProfileUpdated} aiPanel={aiPanel} />}
  </>;
}
