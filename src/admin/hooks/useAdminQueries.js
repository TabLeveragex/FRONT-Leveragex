import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payoutService, usersService, watchlistService } from '../api/adminApiService';

export const queryKeys = {
  stocks: ['admin', 'watchlist', 'stocks'],
  trendStatus: ['admin', 'watchlist', 'trend-status'],
  users: ['admin', 'users'],
};

const REFETCH_MS = 1000;

export function useWatchlistStocks() {
  return useQuery({
    queryKey: queryKeys.stocks,
    queryFn: watchlistService.getStocks,
    refetchInterval: REFETCH_MS,
  });
}

export function useTrendStatus() {
  return useQuery({
    queryKey: queryKeys.trendStatus,
    queryFn: watchlistService.getTrendStatus,
    refetchInterval: REFETCH_MS,
    select: (data) => {
      if (data?.plusMinusToggleEnabled !== undefined) {
        localStorage.setItem('adminTrendControlsEnabled', String(data.plusMinusToggleEnabled));
      }
      return data;
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: usersService.getUsers,
  });
}

function useInvalidateWatchlist() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stocks });
    queryClient.invalidateQueries({ queryKey: queryKeys.trendStatus });
  };
}

export function useAddStock() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: watchlistService.addStock,
    onSuccess: invalidate,
  });
}

export function useUpdateStockAB() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: ({ stockId, A, B }) => watchlistService.updateStockAB(stockId, { A, B }),
    onSuccess: invalidate,
  });
}

export function useTrendModeToggle() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: (enabled) => (enabled ? watchlistService.trendModeOff() : watchlistService.trendModeOn()),
    onSuccess: invalidate,
  });
}

export function useAbModeToggle() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: (enabled) => (enabled ? watchlistService.abModeOff() : watchlistService.abModeOn()),
    onSuccess: invalidate,
  });
}

export function useFluctuationToggle() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: (enabled) =>
      enabled ? watchlistService.fluctuationOff() : watchlistService.fluctuationOn(),
    onSuccess: invalidate,
  });
}

export function useStopAllPrices() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: watchlistService.stopAllPrices,
    onSuccess: invalidate,
  });
}

export function useTrendUp() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: watchlistService.trendUp,
    onSuccess: invalidate,
  });
}

export function useTrendDown() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: watchlistService.trendDown,
    onSuccess: invalidate,
  });
}

export function useUpdateUserBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, balance }) => usersService.updateBalance(userId, balance),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
  });
}

export function useUpdatePayoutStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payoutStatus }) => payoutService.updateStatus(userId, payoutStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
  });
}
