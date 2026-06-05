import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  getGetUserProfileQueryKey,
  updateUserProfile,
  recordStreak,
} from "@workspace/api-client-react";

export function useUserProfileData() {
  return useQuery({
    queryKey: getGetUserProfileQueryKey(),
    queryFn: () => getUserProfile(),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string }) => updateUserProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
    },
  });
}

export function useRecordStreakMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => recordStreak(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
    },
  });
}
