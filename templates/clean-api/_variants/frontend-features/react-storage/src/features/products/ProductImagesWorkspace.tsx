import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import type { ApiResponse, PaginationResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';
import { can, type AuthUser } from '../../core/auth/auth-session';
import { buildBusinessListUrl, FILTER_ENABLED, type BusinessListQuery } from '../business/business-query';
import { productImagesApi, type ProductImage } from './product-images.api';
import './product-images.css';

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  updatedAt: string;
};

type Props = { user: AuthUser };

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxBytes = 5 * 1024 * 1024;
const maxImages = 8;

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    for (const key of ['detail', 'title', 'message']) if (typeof record[key] === 'string') return record[key] as string;
    if (record.errors && typeof record.errors === 'object') {
      const first = Object.values(record.errors as Record<string, unknown>)[0];
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    }
  }
  return 'The request could not be completed.';
}

function pageWindow(current: number, total: number) {
  if (total <= 0) return [];
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function ProductImagesWorkspace({ user }: Props) {
  const [query, setQuery] = useState<BusinessListQuery>({ page: 1, pageSize: 10, sort: 'Name:asc' });
  const [keyword, setKeyword] = useState('');
  const [productPage, setProductPage] = useState<PaginationResponse<Product> | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const canUpdate = can(user, 'products.update');

  const loadProducts = useCallback(async () => {
    setProductsLoading(true); setError('');
    try {
      const response = await customFetch<ApiResponse<PaginationResponse<Product>>>(buildBusinessListUrl('products', query));
      const page = response.results;
      setProductPage(page);
      setSelected(current => current && page.data.some(product => product.id === current.id) ? current : (page.data[0] ?? null));
    } catch (error) { setError(errorMessage(error)); }
    finally { setProductsLoading(false); }
  }, [query]);

  const loadImages = useCallback(async (productId: string) => {
    setImagesLoading(true); setError('');
    try { setImages(await productImagesApi.list(productId)); }
    catch (error) { setImages([]); setError(errorMessage(error)); }
    finally { setImagesLoading(false); }
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);
  useEffect(() => {
    if (selected) void loadImages(selected.id);
    else setImages([]);
  }, [selected?.id, loadImages]);

  const applySearch = (event: FormEvent) => {
    event.preventDefault();
    if (!FILTER_ENABLED) return;
    setQuery(current => ({ ...current, page: 1, keyword: keyword.trim() || undefined, targets: ['Name', 'Sku'], sort: 'Name:asc' }));
  };
  const clearSearch = () => {
    setKeyword('');
    setQuery(current => ({ page: 1, pageSize: current.pageSize, sort: 'Name:asc' }));
  };

  const uploadFiles = async (files: File[]) => {
    if (!selected || !canUpdate || files.length === 0) return;
    setError(''); setNotice('');
    if (images.length >= maxImages) { setError(`A product can have at most ${maxImages} images.`); return; }
    if (files.length > maxImages - images.length) { setError(`Only ${maxImages - images.length} image slot(s) remain for this product.`); return; }
    const invalid = files.find(file => !allowedTypes.has(file.type) || file.size <= 0 || file.size > maxBytes);
    if (invalid) { setError(`${invalid.name}: use JPEG, PNG or WebP files up to 5 MB.`); return; }

    setBusy(true);
    try {
      for (const file of files) await productImagesApi.upload(selected.id, file);
      setNotice(`${files.length} image${files.length === 1 ? '' : 's'} uploaded.`);
      await loadImages(selected.id);
    } catch (error) { setError(errorMessage(error)); await loadImages(selected.id); }
    finally { setBusy(false); }
  };

  const onFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    void uploadFiles(files);
  };

  const remove = async (image: ProductImage) => {
    if (!selected || !canUpdate || !window.confirm('Delete this product image?')) return;
    setBusy(true); setError(''); setNotice('');
    try { await productImagesApi.remove(selected.id, image.id); setNotice('Image deleted.'); await loadImages(selected.id); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  };

  const setPrimary = async (image: ProductImage) => {
    if (!selected || !canUpdate || image.isPrimary) return;
    setBusy(true); setError(''); setNotice('');
    try { await productImagesApi.setPrimary(selected.id, image.id); setNotice('Primary image updated.'); await loadImages(selected.id); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  };

  const paging = productPage?.paging;
  const currentPage = paging?.currentPage ?? query.page;
  const pages = useMemo(() => pageWindow(currentPage, paging?.totalPage ?? 0), [currentPage, paging?.totalPage]);

  return <div className="product-media-page">
    <header className="media-page-heading">
      <div><p className="eyebrow">Object storage</p><h1>Product Images</h1><p>Manage up to eight JPEG, PNG or WebP images per product. Primary images are used as the preferred storefront asset.</p></div>
      <button type="button" className="ghost" onClick={() => selected && void loadImages(selected.id)} disabled={!selected || imagesLoading}>Refresh images</button>
    </header>

    {(error || notice) && <div className={`panel compact-notice ${error ? 'error-panel' : 'success-panel'}`}>{error || notice}</div>}

    <div className="media-workspace-grid">
      <aside className="panel media-products-panel">
        <div className="panel-title"><h2>Products</h2><span>{productPage?.data.length ?? 0} on page</span></div>
        {FILTER_ENABLED && <form className="media-search" onSubmit={applySearch}><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="Search name or SKU"/><button className="primary" type="submit">Search</button><button className="ghost" type="button" onClick={clearSearch}>Clear</button></form>}
        {productsLoading ? <p className="media-muted">Loading products…</p> : <div className="media-product-list">
          {productPage?.data.map(product => <button type="button" key={product.id} className={`media-product-item ${selected?.id === product.id ? 'active' : ''}`} onClick={() => setSelected(product)}>
            <span><strong>{product.name}</strong><small>{product.sku}</small></span><i className={product.isActive ? 'active-dot' : 'inactive-dot'} aria-label={product.isActive ? 'Active' : 'Inactive'} />
          </button>)}
          {!productPage?.data.length && <p className="media-muted">No products found.</p>}
        </div>}
        {paging && <div className="media-pagination"><button className="ghost small" type="button" disabled={!paging.hasPreviousPage} onClick={() => setQuery(current => ({ ...current, page: Math.max(1, currentPage - 1) }))}>Prev</button><div>{pages.map(page => <button type="button" key={page} className={page === currentPage ? 'active' : ''} onClick={() => setQuery(current => ({ ...current, page }))}>{page}</button>)}</div><button className="ghost small" type="button" disabled={!paging.hasNextPage} onClick={() => setQuery(current => ({ ...current, page: currentPage + 1 }))}>Next</button></div>}
      </aside>

      <section className="panel media-gallery-panel">
        {!selected ? <div className="media-empty"><strong>Select a product</strong><span>Choose a product to manage its images.</span></div> : <>
          <div className="media-gallery-heading"><div><p className="eyebrow">{selected.sku}</p><h2>{selected.name}</h2><span>{images.length} / {maxImages} images</span></div>{canUpdate && <label className={`primary upload-button ${busy || images.length >= maxImages ? 'disabled' : ''}`}>Upload images<input type="file" multiple accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" disabled={busy || images.length >= maxImages} onChange={onFilesSelected}/></label>}</div>
          {!canUpdate && <div className="media-readonly">You can view product images. Updating images requires the <code>products.update</code> permission.</div>}
          {imagesLoading ? <p className="media-muted">Loading images…</p> : images.length === 0 ? <div className="media-empty"><strong>No images yet</strong><span>{canUpdate ? 'Upload the first image; it will become primary automatically.' : 'This product does not have any stored images.'}</span></div> : <div className="product-image-grid">
            {images.map(image => <article className={`product-image-card ${image.isPrimary ? 'primary-image' : ''}`} key={image.id}>
              <div className="product-image-preview"><img src={image.url} alt={`${selected.name} product`} loading="lazy"/>{image.isPrimary && <span>Primary</span>}</div>
              <div className="product-image-meta"><small>{new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(image.createdAt))}</small>{canUpdate && <div><button type="button" className="link-button" disabled={busy || image.isPrimary} onClick={() => void setPrimary(image)}>{image.isPrimary ? 'Primary' : 'Set primary'}</button><button type="button" className="link-button danger-link" disabled={busy} onClick={() => void remove(image)}>Delete</button></div>}</div>
            </article>)}
          </div>}
        </>}
      </section>
    </div>
  </div>;
}
