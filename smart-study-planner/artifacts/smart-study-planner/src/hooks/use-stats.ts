import { useQuery } from "@tanstack/react-query";
import {
  getHealthCheckQueryKey,
  healthCheck,
  getStatsOverview,
  getGetStatsOverviewQueryKey,
  getWeeklyStats,
  getGetWeeklyStatsQueryKey,
  getStatsByCategory,
  getGetStatsByCategoryQueryKey,
  getDailyQuote,
  getGetDailyQuoteQueryKey,
} from "@workspace/api-client-react";

export function useHealthCheckData() {
  return useQuery({
    queryKey: getHealthCheckQueryKey(),
    queryFn: () => healthCheck(),
  });
}

export function useStatsOverviewData() {
  return useQuery({
    queryKey: getGetStatsOverviewQueryKey(),
    queryFn: () => getStatsOverview(),
  });
}

export function useWeeklyStatsData() {
  return useQuery({
    queryKey: getGetWeeklyStatsQueryKey(),
    queryFn: () => getWeeklyStats(),
  });
}

export function useStatsByCategoryData() {
  return useQuery({
    queryKey: getGetStatsByCategoryQueryKey(),
    queryFn: () => getStatsByCategory(),
  });
}

export function useDailyQuoteData() {
  return useQuery({
    queryKey: getGetDailyQuoteQueryKey(),
    queryFn: () => getDailyQuote(),
  });
}
