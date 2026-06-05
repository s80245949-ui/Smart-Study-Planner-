import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  getGetTasksQueryKey,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  getTask,
  getGetTaskQueryKey,
  getSubtasks,
  getGetSubtasksQueryKey,
  createSubtask,
} from "@workspace/api-client-react";

export function useTasksData(params?: { category?: string; priority?: string; completed?: boolean; parentId?: number }) {
  return useQuery({
    queryKey: getGetTasksQueryKey(params as any),
    queryFn: () => getTasks(params as any),
  });
}

export function useTaskData(id: number) {
  return useQuery({
    queryKey: getGetTaskQueryKey(id),
    queryFn: () => getTask(id),
    enabled: !!id,
  });
}

export function useSubtasksData(id: number) {
  return useQuery({
    queryKey: getGetSubtasksQueryKey(id),
    queryFn: () => getSubtasks(id),
    enabled: !!id,
  });
}
