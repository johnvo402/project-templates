import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from './user.api';

type Props = { canManage: boolean };
export function UsersPage({ canManage }: Props) {
  const client = useQueryClient(); const users = useQuery({ queryKey: ['users'], queryFn: userApi.list });
  const role = useMutation({ mutationFn: ({id, role}:{id:string;role:string}) => userApi.changeRole(id, role), onSuccess: () => client.invalidateQueries({queryKey:['users']}) });
  return <section className="card"><div className="section-heading"><div><p className="eyebrow">Administration</p><h2>Users</h2></div><span className="pill">{users.data?.length ?? 0}</span></div>
    <div className="user-list">{users.data?.map(user=><div className="user-row" key={user.id}><div className="mini-avatar">{user.displayName.slice(0,1).toUpperCase()}</div><div className="grow"><strong>{user.displayName}</strong><span>{user.email}</span></div>{canManage ? <select value={user.role} disabled={role.isPending} onChange={e=>role.mutate({id:user.id,role:e.target.value})}><option>Admin</option><option>User</option></select> : <span className="pill">{user.role}</span>}</div>)}</div>
  </section>;
}
