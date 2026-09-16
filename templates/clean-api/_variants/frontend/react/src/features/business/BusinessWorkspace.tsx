import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ApiResponse, PaginationResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';
import { can, type AuthUser } from '../../core/auth/auth-session';
import { ProfilePage } from '../profile/ProfilePage';
import './business.css';

type Section = 'dashboard' | 'orders' | 'products' | 'employees' | 'reports' | 'settings' | 'profile' | 'ai';
type Dashboard = {
  revenueToday: number; revenueThisMonth: number; totalOrders: number; pendingOrders: number;
  totalProducts: number; lowStockProducts: number; totalEmployees: number;
  topProducts: { productName: string; quantity: number; revenue: number }[];
  recentOrders: { id: string; orderNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string }[];
};
type Product = { id: string; name: string; sku: string; price: number; stockQuantity: number; isActive: boolean; updatedAt: string };
type ProductDraft = { name: string; sku: string; price: number; stockQuantity: number; isActive: boolean };
type Order = { id: string; orderNumber: string; customerName: string; status: string; totalAmount: number; itemCount: number; createdAt: string };
type OrderItemDraft = { productId: string; quantity: number };
type Employee = { id: string; email: string; displayName: string; role: string; isActive: boolean; avatarUrl?: string | null; createdAt: string };
type StoreSettings = { storeName: string; storeEmail: string; storePhone: string; currency: string; timezone: string; lowStockThreshold: number };

type Props = {
  user: AuthUser;
  onProfileUpdated: (displayName: string) => void;
  aiPanel?: ReactNode;
};

const emptyProduct: ProductDraft = { name: '', sku: '', price: 0, stockQuantity: 0, isActive: true };
const roles = ['Admin', 'Manager', 'Staff'];
const money = (value: number, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value ?? 0);
const shortDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
const statusClass = (status: string) => `status status-${status.toLowerCase()}`;

async function apiResult<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await customFetch<ApiResponse<T>>(path, options);
  return response.results;
}

async function apiCommand(path: string, options: RequestInit): Promise<void> {
  await customFetch<unknown>(path, options);
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

function errorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    for (const key of ['detail', 'title', 'message']) if (typeof record[key] === 'string') return record[key] as string;
    const errors = record.errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors as Record<string, unknown>)[0];
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    }
  }
  return 'The request could not be completed.';
}

export function BusinessWorkspace({ user, onProfileUpdated, aiPanel }: Props) {
  const navigation = useMemo(() => [
    can(user, 'dashboard.view') && { id: 'dashboard' as const, label: 'Dashboard', group: 'Overview' },
    can(user, 'orders.view') && { id: 'orders' as const, label: 'Orders', group: 'Sales' },
    can(user, 'products.view') && { id: 'products' as const, label: 'Products', group: 'Sales' },
    can(user, 'employees.view') && { id: 'employees' as const, label: 'Employees', group: 'Management' },
    can(user, 'reports.view') && { id: 'reports' as const, label: 'Reports', group: 'Analytics' },
    can(user, 'settings.view') && { id: 'settings' as const, label: 'Settings', group: 'System' },
    { id: 'profile' as const, label: 'Profile', group: 'Account' },
    aiPanel && can(user, 'ai.generate') && { id: 'ai' as const, label: 'AI Assistant', group: 'Account' },
  ].filter(Boolean) as { id: Section; label: string; group: string }[], [user, aiPanel]);

  const [section, setSection] = useState<Section>(() => navigation[0]?.id ?? 'profile');
  const grouped = useMemo(() => navigation.reduce<Record<string, typeof navigation>>((acc, item) => {
    (acc[item.group] ??= []).push(item); return acc;
  }, {}), [navigation]);

  return <div className="business-layout">
    <aside className="business-sidebar">
      <div className="sidebar-heading"><span className="sidebar-kicker">Mini Store</span><strong>Operations</strong></div>
      <nav>{Object.entries(grouped).map(([group, items]) => <div className="nav-group" key={group}>
        <span>{group}</span>
        {items.map(item => <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}>{item.label}</button>)}
      </div>)}</nav>
    </aside>
    <section className="business-content">
      {section === 'dashboard' && <DashboardPanel />}
      {section === 'products' && <ProductsPanel user={user} />}
      {section === 'orders' && <OrdersPanel user={user} />}
      {section === 'employees' && <EmployeesPanel user={user} />}
      {section === 'reports' && <ReportsPanel />}
      {section === 'settings' && <SettingsPanel canUpdate={can(user, 'settings.update')} />}
      {section === 'profile' && <ProfilePage user={user} onProfileUpdated={onProfileUpdated} />}
      {section === 'ai' && aiPanel}
    </section>
  </div>;
}

function PageHeader({ eyebrow, title, copy, actions }: { eyebrow: string; title: string; copy: string; actions?: ReactNode }) {
  return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div>{actions && <div className="page-actions">{actions}</div>}</header>;
}

function useLoad<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true); setError('');
    return loader().then(setData).catch(error => setError(errorMessage(error))).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  useEffect(() => { void reload(); }, [reload]);
  return { data, error, loading, reload };
}

function LoadState({ loading, error }: { loading: boolean; error: string }) {
  if (loading) return <div className="panel muted-panel">Loading data…</div>;
  if (error) return <div className="panel error-panel">{error}</div>;
  return null;
}

function MutationNotice({ message, error }: { message: string; error: string }) {
  if (!message && !error) return null;
  return <div className={`panel compact-notice ${error ? 'error-panel' : 'success-panel'}`}>{error || message}</div>;
}

function DashboardPanel() {
  const state = useLoad(() => apiResult<Dashboard>('/api/dashboard'));
  if (state.loading || state.error || !state.data) return <><PageHeader eyebrow="Overview" title="Dashboard" copy="Live operational snapshot for your store." /><LoadState {...state} /></>;
  const d = state.data;
  const cards = [
    ['Revenue today', money(d.revenueToday)], ['Revenue this month', money(d.revenueThisMonth)],
    ['Orders', d.totalOrders], ['Pending orders', d.pendingOrders], ['Products', d.totalProducts],
    ['Low stock', d.lowStockProducts], ['Employees', d.totalEmployees],
  ];
  return <><PageHeader eyebrow="Overview" title="Dashboard" copy="Live operational snapshot for your store." />
    <div className="metric-grid">{cards.map(([label, value]) => <article className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
    <div className="content-grid two-columns">
      <article className="panel"><div className="panel-title"><h2>Top products</h2><span>By revenue</span></div>
        <div className="stack-list">{d.topProducts?.slice(0, 6).map((item, index) => <div className="rank-row" key={`${item.productName}-${index}`}><b>{index + 1}</b><div><strong>{item.productName}</strong><span>{item.quantity} sold</span></div><em>{money(item.revenue)}</em></div>)}</div>
      </article>
      <article className="panel"><div className="panel-title"><h2>Recent orders</h2><span>Latest activity</span></div>
        <div className="stack-list">{d.recentOrders?.slice(0, 6).map(order => <div className="order-row" key={order.id}><div><strong>{order.orderNumber}</strong><span>{order.customerName}</span></div><span className={statusClass(order.status)}>{order.status}</span><em>{money(order.totalAmount)}</em></div>)}</div>
      </article>
    </div>
  </>;
}

function ProductsPanel({ user }: { user: AuthUser }) {
  const state = useLoad(() => apiResult<PaginationResponse<Product>>('/api/products?page=1&pageSize=20'));
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [mutationError, setMutationError] = useState('');
  const canCreate = can(user, 'products.create');
  const canUpdate = can(user, 'products.update');
  const canDelete = can(user, 'products.delete');

  const openCreate = () => { setEditing(null); setDraft(emptyProduct); setShowForm(true); setNotice(''); setMutationError(''); };
  const openEdit = (product: Product) => {
    setEditing(product);
    setDraft({ name: product.name, sku: product.sku, price: product.price, stockQuantity: product.stockQuantity, isActive: product.isActive });
    setShowForm(true); setNotice(''); setMutationError('');
  };
  const save = async () => {
    setSaving(true); setMutationError(''); setNotice('');
    try {
      if (editing) await apiCommand(`/api/products/${editing.id}`, json('PUT', draft));
      else await apiCommand('/api/products', json('POST', draft));
      setNotice(editing ? 'Product updated.' : 'Product created.');
      setShowForm(false); setEditing(null); setDraft(emptyProduct); await state.reload();
    } catch (error) { setMutationError(errorMessage(error)); } finally { setSaving(false); }
  };
  const remove = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setMutationError(''); setNotice('');
    try { await apiCommand(`/api/products/${product.id}`, { method: 'DELETE' }); setNotice('Product deleted.'); await state.reload(); }
    catch (error) { setMutationError(errorMessage(error)); }
  };

  return <>
    <PageHeader eyebrow="Sales" title="Products" copy="Catalog, pricing and stock at a glance." actions={<>
      <button className="ghost" onClick={() => void state.reload()}>Refresh</button>
      {canCreate && <button className="primary" onClick={openCreate}>Add product</button>}
    </>} />
    <LoadState {...state} /><MutationNotice message={notice} error={mutationError} />
    {showForm && <article className="panel editor-panel">
      <div className="panel-title"><h2>{editing ? 'Edit product' : 'New product'}</h2><button className="link-button" onClick={() => setShowForm(false)}>Close</button></div>
      <div className="form-grid">
        <label>Name<input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
        <label>SKU<input value={draft.sku} onChange={e => setDraft({ ...draft, sku: e.target.value.toUpperCase() })} /></label>
        <label>Price<input type="number" min="0" step="0.01" value={draft.price} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} /></label>
        <label>Stock quantity<input type="number" min="0" value={draft.stockQuantity} onChange={e => setDraft({ ...draft, stockQuantity: Number(e.target.value) })} /></label>
        <label className="check-field"><input type="checkbox" checked={draft.isActive} onChange={e => setDraft({ ...draft, isActive: e.target.checked })} /> Active</label>
      </div>
      <div className="form-actions"><button className="primary" disabled={saving || !draft.name.trim() || !draft.sku.trim()} onClick={() => void save()}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button></div>
    </article>}
    {state.data && <Table headers={['Product', 'SKU', 'Price', 'Stock', 'Status', 'Updated', 'Actions']} rows={state.data.data.map(product => [
      product.name, product.sku, money(product.price), product.stockQuantity,
      <span className={product.isActive ? 'status status-completed' : 'status status-cancelled'}>{product.isActive ? 'Active' : 'Inactive'}</span>, shortDate(product.updatedAt),
      <div className="row-actions">{canUpdate && <button onClick={() => openEdit(product)}>Edit</button>}{canDelete && <button className="danger-link" onClick={() => void remove(product)}>Delete</button>}</div>,
    ])} />}
  </>;
}

function OrdersPanel({ user }: { user: AuthUser }) {
  const state = useLoad(() => apiResult<PaginationResponse<Order>>('/api/orders?page=1&pageSize=20'));
  const products = useLoad(() => apiResult<PaginationResponse<Product>>('/api/products?page=1&pageSize=100&isActive=true'));
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<OrderItemDraft[]>([{ productId: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [mutationError, setMutationError] = useState('');
  const canCreate = can(user, 'orders.create');
  const canUpdate = can(user, 'orders.update-status');
  const canCancel = can(user, 'orders.cancel');

  const createOrder = async () => {
    setSaving(true); setMutationError(''); setNotice('');
    try {
      await apiCommand('/api/orders', json('POST', {
        customerName, customerPhone: customerPhone.trim() || null,
        items: items.filter(item => item.productId).map(item => ({ productId: item.productId, quantity: item.quantity })),
      }));
      setNotice('Order created.'); setCustomerName(''); setCustomerPhone(''); setItems([{ productId: '', quantity: 1 }]); setShowForm(false); await state.reload();
    } catch (error) { setMutationError(errorMessage(error)); } finally { setSaving(false); }
  };
  const updateStatus = async (order: Order, status: 'Processing' | 'Completed') => {
    setMutationError(''); setNotice('');
    try { await apiCommand(`/api/orders/${order.id}/status`, json('PUT', { status })); setNotice(`Order moved to ${status}.`); await state.reload(); }
    catch (error) { setMutationError(errorMessage(error)); }
  };
  const cancelOrder = async (order: Order) => {
    if (!window.confirm(`Cancel ${order.orderNumber}? Stock will be restored.`)) return;
    setMutationError(''); setNotice('');
    try { await apiCommand(`/api/orders/${order.id}/cancel`, { method: 'POST' }); setNotice('Order cancelled.'); await state.reload(); }
    catch (error) { setMutationError(errorMessage(error)); }
  };
  const addItem = () => setItems(current => [...current, { productId: '', quantity: 1 }]);
  const setItem = (index: number, patch: Partial<OrderItemDraft>) => setItems(current => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  const removeItem = (index: number) => setItems(current => current.length === 1 ? current : current.filter((_, i) => i !== index));

  return <>
    <PageHeader eyebrow="Sales" title="Orders" copy="Create orders and move them through fulfillment." actions={<>
      <button className="ghost" onClick={() => void state.reload()}>Refresh</button>
      {canCreate && <button className="primary" onClick={() => { setShowForm(true); setMutationError(''); setNotice(''); }}>New order</button>}
    </>} />
    <LoadState {...state} /><MutationNotice message={notice} error={mutationError} />
    {showForm && <article className="panel editor-panel">
      <div className="panel-title"><h2>New order</h2><button className="link-button" onClick={() => setShowForm(false)}>Close</button></div>
      <div className="form-grid">
        <label>Customer name<input value={customerName} onChange={e => setCustomerName(e.target.value)} /></label>
        <label>Phone<input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} /></label>
      </div>
      <div className="order-items">
        <div className="subheading"><strong>Items</strong><button className="ghost small" onClick={addItem}>Add item</button></div>
        {items.map((item, index) => <div className="item-row" key={index}>
          <select value={item.productId} onChange={e => setItem(index, { productId: e.target.value })}>
            <option value="">Select product</option>
            {products.data?.data.map(product => <option key={product.id} value={product.id}>{product.name} · {money(product.price)} · {product.stockQuantity} in stock</option>)}
          </select>
          <input aria-label="Quantity" type="number" min="1" value={item.quantity} onChange={e => setItem(index, { quantity: Math.max(1, Number(e.target.value)) })} />
          <button className="link-button danger-link" onClick={() => removeItem(index)}>Remove</button>
        </div>)}
      </div>
      <div className="form-actions"><button className="primary" disabled={saving || !customerName.trim() || !items.some(item => item.productId)} onClick={() => void createOrder()}>{saving ? 'Creating…' : 'Create order'}</button></div>
    </article>}
    {state.data && <Table headers={['Order', 'Customer', 'Status', 'Items', 'Total', 'Created', 'Actions']} rows={state.data.data.map(order => [
      order.orderNumber, order.customerName, <span className={statusClass(order.status)}>{order.status}</span>, order.itemCount, money(order.totalAmount), shortDate(order.createdAt),
      <div className="row-actions">
        {canUpdate && order.status === 'Pending' && <button onClick={() => void updateStatus(order, 'Processing')}>Process</button>}
        {canUpdate && (order.status === 'Pending' || order.status === 'Processing') && <button onClick={() => void updateStatus(order, 'Completed')}>Complete</button>}
        {canCancel && order.status !== 'Completed' && order.status !== 'Cancelled' && <button className="danger-link" onClick={() => void cancelOrder(order)}>Cancel</button>}
      </div>,
    ])} />}
  </>;
}

function EmployeesPanel({ user }: { user: AuthUser }) {
  const state = useLoad(() => apiResult<PaginationResponse<Employee>>('/api/employees?page=1&pageSize=20'));
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ email: '', password: '', displayName: '', role: 'Staff' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [mutationError, setMutationError] = useState('');
  const canCreate = can(user, 'employees.create');
  const canUpdate = can(user, 'employees.update');
  const canChangeRole = can(user, 'employees.change-role');

  const createEmployee = async () => {
    setSaving(true); setMutationError(''); setNotice('');
    try {
      await apiCommand('/api/employees', json('POST', draft));
      setNotice('Employee created.'); setDraft({ email: '', password: '', displayName: '', role: 'Staff' }); setShowForm(false); await state.reload();
    } catch (error) { setMutationError(errorMessage(error)); } finally { setSaving(false); }
  };
  const changeRole = async (employee: Employee, role: string) => {
    setMutationError(''); setNotice('');
    try { await apiCommand(`/api/employees/${employee.id}/role`, json('PUT', { role })); setNotice(`${employee.displayName}'s role updated.`); await state.reload(); }
    catch (error) { setMutationError(errorMessage(error)); }
  };
  const setStatus = async (employee: Employee) => {
    const next = !employee.isActive;
    setMutationError(''); setNotice('');
    try { await apiCommand(`/api/employees/${employee.id}/status`, json('PUT', { isActive: next })); setNotice(`${employee.displayName} ${next ? 'enabled' : 'disabled'}.`); await state.reload(); }
    catch (error) { setMutationError(errorMessage(error)); }
  };

  return <>
    <PageHeader eyebrow="Management" title="Employees" copy="Team access, roles and account status." actions={<>
      <button className="ghost" onClick={() => void state.reload()}>Refresh</button>
      {canCreate && <button className="primary" onClick={() => { setShowForm(true); setMutationError(''); setNotice(''); }}>Add employee</button>}
    </>} />
    <LoadState {...state} /><MutationNotice message={notice} error={mutationError} />
    {showForm && <article className="panel editor-panel">
      <div className="panel-title"><h2>New employee</h2><button className="link-button" onClick={() => setShowForm(false)}>Close</button></div>
      <div className="form-grid">
        <label>Display name<input value={draft.displayName} onChange={e => setDraft({ ...draft, displayName: e.target.value })} /></label>
        <label>Email<input type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} /></label>
        <label>Temporary password<input type="password" value={draft.password} onChange={e => setDraft({ ...draft, password: e.target.value })} /></label>
        <label>Role<select value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })}>{roles.map(role => <option key={role}>{role}</option>)}</select></label>
      </div>
      <div className="form-actions"><button className="primary" disabled={saving || !draft.displayName.trim() || !draft.email.trim() || !draft.password} onClick={() => void createEmployee()}>{saving ? 'Creating…' : 'Create employee'}</button></div>
    </article>}
    {state.data && <Table headers={['Employee', 'Email', 'Role', 'Status', 'Joined', 'Actions']} rows={state.data.data.map(employee => [
      <span className="person-cell">{employee.avatarUrl ? <img src={employee.avatarUrl} alt="" /> : <i>{employee.displayName.slice(0, 1).toUpperCase()}</i>}<strong>{employee.displayName}</strong></span>,
      employee.email,
      canChangeRole ? <select className="table-select" value={employee.role} onChange={e => void changeRole(employee, e.target.value)}>{roles.map(role => <option key={role}>{role}</option>)}</select> : employee.role,
      <span className={employee.isActive ? 'status status-completed' : 'status status-cancelled'}>{employee.isActive ? 'Active' : 'Disabled'}</span>,
      shortDate(employee.createdAt),
      <div className="row-actions">{canUpdate && <button className={employee.isActive ? 'danger-link' : ''} onClick={() => void setStatus(employee)}>{employee.isActive ? 'Disable' : 'Enable'}</button>}</div>,
    ])} />}
  </>;
}

function ReportsPanel() {
  const top = useLoad(() => apiResult<{ productName: string; quantity: number; revenue: number }[]>('/api/reports/top-products?take=10'));
  const statuses = useLoad(() => apiResult<{ status: string; count: number }[]>('/api/reports/orders-by-status'));
  return <><PageHeader eyebrow="Analytics" title="Reports" copy="Simple business signals without turning the starter into an ERP." /><LoadState loading={top.loading || statuses.loading} error={top.error || statuses.error} />
    <div className="content-grid two-columns">
      <article className="panel"><div className="panel-title"><h2>Top products</h2></div>{top.data?.map((item, index) => <div className="report-line" key={`${item.productName}-${index}`}><span>{item.productName}</span><strong>{item.quantity}</strong><em>{money(item.revenue)}</em></div>)}</article>
      <article className="panel"><div className="panel-title"><h2>Orders by status</h2></div>{statuses.data?.map(item => <div className="report-line" key={item.status}><span>{item.status}</span><strong>{item.count}</strong></div>)}</article>
    </div>
  </>;
}

function SettingsPanel({ canUpdate }: { canUpdate: boolean }) {
  const state = useLoad(() => apiResult<StoreSettings>('/api/settings'));
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => { if (state.data) setDraft(state.data); }, [state.data]);
  if (state.loading || state.error || !draft) return <><PageHeader eyebrow="System" title="Settings" copy="Store identity and operational defaults." /><LoadState {...state} /></>;
  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => setDraft(current => current ? { ...current, [key]: value } : current);
  const save = async () => {
    setMessage('Saving…');
    try { await apiResult<StoreSettings>('/api/settings', json('PUT', draft)); setMessage('Settings saved.'); }
    catch { setMessage('Could not save settings.'); }
  };
  return <><PageHeader eyebrow="System" title="Settings" copy="Store identity and operational defaults." />
    <article className="panel settings-form"><div className="form-grid">
      <label>Store name<input value={draft.storeName} disabled={!canUpdate} onChange={e => set('storeName', e.target.value)} /></label>
      <label>Email<input value={draft.storeEmail} disabled={!canUpdate} onChange={e => set('storeEmail', e.target.value)} /></label>
      <label>Phone<input value={draft.storePhone} disabled={!canUpdate} onChange={e => set('storePhone', e.target.value)} /></label>
      <label>Currency<input value={draft.currency} disabled={!canUpdate} onChange={e => set('currency', e.target.value.toUpperCase())} /></label>
      <label>Timezone<input value={draft.timezone} disabled={!canUpdate} onChange={e => set('timezone', e.target.value)} /></label>
      <label>Low-stock threshold<input type="number" min="0" value={draft.lowStockThreshold} disabled={!canUpdate} onChange={e => set('lowStockThreshold', Number(e.target.value))} /></label>
    </div>{canUpdate && <div className="form-actions"><button className="primary" onClick={() => void save()}>Save settings</button><span>{message}</span></div>}</article>
  </>;
}

function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return <div className="panel table-panel"><div className="table-wrap"><table><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="empty-cell">No records yet.</td></tr>}</tbody></table></div></div>;
}
