import { FormEvent, useState } from 'react';
import { buildPaginationItems } from '../../shared/pagination';
import { useCompleteTodo, useCreateTodo, useTodos } from './todo.queries';

type Props = { canWrite: boolean };

export function TodoPage({ canWrite }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [title, setTitle] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const todos = useTodos({ page, pageSize, search });
  const createTodo = useCreateTodo();
  const completeTodo = useCompleteTodo();
  const paging = todos.data?.paging;
  const currentPage = paging?.currentPage ?? page;
  const totalPages = Math.max(paging?.totalPage ?? 0, 1);
  const paginationItems = buildPaginationItems(currentPage, totalPages);

  function create(event: FormEvent) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    createTodo.mutate(value, { onSuccess: () => { setTitle(''); setPage(1); } });
  }

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  return <section className="card span-2">
    <div className="section-heading"><div><p className="eyebrow">Productivity</p><h2>Todo list</h2></div><button className="ghost" onClick={() => todos.refetch()}>Refresh</button></div>
    <form className="search-row" onSubmit={applySearch}><input placeholder="Search title with LHS $containsi…" value={searchInput} onChange={event => setSearchInput(event.target.value)} /><button>Search</button>{search && <button type="button" className="ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>Clear</button>}</form>
    {canWrite && <form className="inline-form" onSubmit={create}><input placeholder="What needs to be done?" value={title} onChange={event => setTitle(event.target.value)} /><button className="primary" disabled={createTodo.isPending}>Add task</button></form>}
    {todos.isLoading && <p className="muted">Loading tasks…</p>}
    {todos.error && <p className="error surface-error">Could not load todos.</p>}
    <ul className="todo-list">{todos.data?.data.map(todo => <li key={todo.id}><button className={`check ${todo.isCompleted ? 'checked' : ''}`} disabled={!canWrite || todo.isCompleted || completeTodo.isPending} onClick={() => completeTodo.mutate(todo.id)}>✓</button><div><strong className={todo.isCompleted ? 'done' : ''}>{todo.title}</strong><span>{new Date(todo.createdAtUtc).toLocaleString()}</span></div><span className={`pill ${todo.isCompleted ? 'success' : ''}`}>{todo.isCompleted ? 'Done' : 'Open'}</span></li>)}</ul>
    {!todos.isLoading && todos.data?.data.length === 0 && <div className="empty-state">No tasks match this page/filter.</div>}
    <div className="pagination">
      <label>Rows<select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}><option>5</option><option>10</option><option>20</option></select></label>
      <div className="pagination-pages">
        <button disabled={!paging?.hasPreviousPage} onClick={() => setPage(value => Math.max(1, value - 1))}>Prev</button>
        {paginationItems.map((item, index) => item === 'ellipsis'
          ? <span className="pagination-ellipsis" key={`ellipsis-${index}`}>…</span>
          : <button key={item} className={`page-number ${item === currentPage ? 'active' : ''}`} aria-current={item === currentPage ? 'page' : undefined} onClick={() => setPage(item)}>{item}</button>)}
        <button disabled={!paging?.hasNextPage} onClick={() => setPage(value => value + 1)}>Next</button>
      </div>
    </div>
  </section>;
}
