import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { todoApi, type TodoListInput } from './todo.api';

const todoKeys = { all: ['todos'] as const, list: (input: TodoListInput) => ['todos', input] as const };
export function useTodos(input: TodoListInput) { return useQuery({ queryKey: todoKeys.list(input), queryFn: () => todoApi.list(input) }); }
export function useCreateTodo() { const client = useQueryClient(); return useMutation({ mutationFn: todoApi.create, onSuccess: () => client.invalidateQueries({ queryKey: todoKeys.all }) }); }
export function useCompleteTodo() { const client = useQueryClient(); return useMutation({ mutationFn: todoApi.complete, onSuccess: () => client.invalidateQueries({ queryKey: todoKeys.all }) }); }
