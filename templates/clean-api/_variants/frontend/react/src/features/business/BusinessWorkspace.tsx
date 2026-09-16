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
type Order = { id: string; orderNumber: string; customerName: string; status: string; totalAmount: number; itemCount: number; createdAt: string };
type Employee = { id: string; email: string; displayName: string; role: string; isActive: boolean; avatarUrl?: string | null; createdAt: string };
type StoreSettings = { storeName: string; storeEmail: string; storePhone: string; currency: string; timezone: string; lowStockThreshold: number };

type Props = {
  user: AuthUser;
  onProfileUpdated: (displayName: string) => void;
  aiPanel?: ReactNode;
};

const money = (value: number, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value ?? 0);
const shortDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
const statusClass = (status: string) => `status status-${status.toLowerCase()}`;

async function apiResult<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await customFetch<ApiResponse<T>>(path, options);
  return response.results;
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
      {section === 'products' && <ProductsPanel />}
      {section === 'orders' && <OrdersPanel />}
      {section === 'employees' && <EmployeesPanel />}
      {section === 'reports' && <ReportsPanel />}
      {section === 'settings' && <SettingsPanel canUpdate={can(user, 'settings.update')} />}
      {section === 'profile' && <ProfilePage user={user} onProfileUpdated={onProfileUpdated} />}
      {section === 'ai' && aiPanel}
    </section>
  </div>;
}

function PageHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div></header>;
}

function useLoad<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true); setError('');
    return loader().then(setData).catch(error => setError(error instanceof Error ? error.message : 'Unable to load data.')).finally(() => setLoading(false));
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

function ProductsPanel() {
  const state = useLoad(() => apiResult<PaginationResponse<Product>>('/api/products?page=1&pageSize=20'));
  return <><PageHeader eyebrow="Sales" title="Products" copy="Catalog, pricing and stock at a glance." /><LoadState {...state} />
    {state.data && <Table headers={['Product', 'SKU', 'Price', 'Stock', 'Status', 'Updated']} rows={state.data.data.map(product => [
      product.name, product.sku, money(product.price), product.stockQuantity,
      <span className={product.isActive ? 'status status-completed' : 'status status-cancelled'}>{product.isActive ? 'Active' : 'Inactive'}</span>, shortDate(product.updatedAt),
    ])} />}
  </>;
}

function OrdersPanel() {
  const state = useLoad(() => apiResult<PaginationResponse<Order>>('/api/orders?page=1&pageSize=20'));
  return <><PageHeader eyebrow="Sales" title="Orders" copy="Track fulfillment status and order value." /><LoadState {...state} />
    {state.data && <Table headers={['Order', 'Customer', 'Status', 'Items', 'Total', 'Created']} rows={state.data.data.map(order => [
      order.orderNumber, order.customerName, <span className={statusClass(order.status)}>{order.status}</span>, order.itemCount, money(order.totalAmount), shortDate(order.createdAt),
    ])} />}
  </>;
}

function EmployeesPanel() {
  const state = useLoad(() => apiResult<PaginationResponse<Employee>>('/api/employees?page=1&pageSize=20'));
  return <><PageHeader eyebrow="Management" title="Employees" copy="Team access, roles and account status." /><LoadState {...state} />
    {state.data && <Table headers={['Employee', 'Email', 'Role', 'Status', 'Joined']} rows={state.data.data.map(employee => [
      <span className="person-cell">{employee.avatarUrl ? <img src={employee.avatarUrl} alt="" /> : <i>{employee.displayName.slice(0, 1).toUpperCase()}</i>}<strong>{employee.displayName}</strong></span>,
      employee.email, employee.role, <span className={employee.isActive ? 'status status-completed' : 'status status-cancelled'}>{employee.isActive ? 'Active' : 'Disabled'}</span>, shortDate(employee.createdAt),
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
    try { await apiResult<StoreSettings>('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) }); setMessage('Settings saved.'); }
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
