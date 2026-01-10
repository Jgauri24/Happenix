import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for common event mutations (bookmark, book, track view)
 */
export const useEventMutations = (eventId) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Track view mutation
  const trackViewMutation = useMutation({
    mutationFn: async () => {
      if (user) {
        await api.post(`/events/${eventId}/view`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'recently-viewed']);
    }
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/events/${eventId}/bookmark`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.bookmarked ? 'Event bookmarked' : 'Bookmark removed');
      queryClient.invalidateQueries(['user', 'bookmarks']);
    }
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/bookings', { eventId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Event booked successfully!');
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['event', eventId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  });

  // Auto-track view on mount
  useEffect(() => {
    if (user) {
      trackViewMutation.mutate();
    }
  }, [eventId, user]);

  return {
    bookmarkMutation,
    bookingMutation,
    trackViewMutation
  };
};
