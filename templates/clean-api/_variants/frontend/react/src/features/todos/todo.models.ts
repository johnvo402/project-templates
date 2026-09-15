export type Todo = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAtUtc: string;
  completedAtUtc?: string | null;
};
