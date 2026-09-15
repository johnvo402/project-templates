import { FormEvent, useState } from 'react';
import { useCompleteTodo, useCreateTodo, useTodos } from './todo.queries';

type Props = { canWrite: boolean };

export function TodoPage({ canWrite }: Props) {
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [title, setTitle] = useState('');
  const todos = useTodos({ page, pageSize }); const createTodo = useCreateTodo(); const completeTodo = useCompleteTodo();
  const paging = todos.data?.paging;
  function submit(event: FormEvent) { event.preventDefault(); const value = title.trim(); if (!value) return; createTodo.mutate(value, { onSuccess: () => { setTitle(''); setPage(1); } }); }

  return <section className="card span-2">
    <div className="section-heading"><div><p className="eyebrow">Productivity</p><h2>Todo list</h2></div><button className="ghost" onClick={() => todos.refetch()}>Refresh</button></div>
    {canWrite && <form className="inline-form" onSubmit={submit}><input placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} /><button className="primary" disabled={createTodo.isPending}>Add task</button></form>}
    {todos.isLoading && <p className="muted">Loading tasks…</p>}
    {todos.error && <p className="error surface-error">Could not load todos.</p>}
    <ul className="todo-list">{todos.data?.data.map(todo => <li key={todo.id}><button className={`check ${todo.isCompleted ? 'checked' : ''}`} disabled={!canWrite || todo.isCompleted || completeTodo.isPending} onClick={() => completeTodo.mutate(todo.id)} aria-label="Complete todo">✓</button><div><strong className={todo.isCompleted ? 'done' : ''}>{todo.title}</strong><span>{new Date(todo.createdAtUtc).toLocaleString()}</span></div><span className={`pill ${todo.isCompleted ? 'success' : ''}`}>{todo.isCompleted ? 'Done' : 'Open'}</span></li>)}</ul>
    {!todos.isLoading && todos.data?.data.length === 0 && <div className="empty-state">No tasks on this page.</div>}
    <div className="pagination"><label>Rows<select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}><option>5</option><option>10</option><option>20</option></select></label><div><button disabled={!paging?.hasPreviousPage} onClick={() => setPage(x => Math.max(1, x - 1))}>Previous</button><span>Page {paging?.currentPage ?? page} / {Math.max(paging?.totalPage ?? 0, 1)}</span><button disabled={!paging?.hasNextPage} onClick={() => setPage(x => x + 1)}>Next</button></div></div>
  </section>;
}
