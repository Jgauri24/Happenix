import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import EventForm from '../../components/EventForm';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data.event;
    }
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'offline',
    price: '0',
    date: '',
    time: '',
    duration: '60',
    locationName: '',
    city: '',
    address: '',
    onlineLink: '',
    maxAttendees: '',
    status: 'active',
    lat: '',
    lng: ''
  });

  const [poster, setPoster] = useState(null);

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        type: data.type || 'offline',
        price: data.price?.toString() || '0',
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        time: data.time || '',
        duration: data.duration?.toString() || '60',
        locationName: data.locationName || '',
        city: data.city || '',
        lat: data.lat || '',
        lng: data.lng || '',
        address: '',
        onlineLink: data.onlineLink || '',
        maxAttendees: data.maxAttendees?.toString() || '',
        status: data.status || 'active',
        poster: data.poster || ''
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'poster' && data[key] !== '') {
          formDataToSend.append(key, data[key]);
        }
      });

      // Fix for online events: City is required by backend but hidden in form
      if (data.type === 'online' && !data.city) {
        formDataToSend.append('city', 'Online');
      }

      if (poster) {
        formDataToSend.append('poster', poster);
      }

      const res = await api.put(`/events/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Event updated successfully!');
      queryClient.invalidateQueries(['event', id]);
      queryClient.invalidateQueries(['admin', 'events']);
      navigate('/admin/events');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update event');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Edit Event</h1>

      <EventForm
        formData={formData}
        setFormData={setFormData}
        poster={poster}
        setPoster={setPoster}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Update Event"
        onCancel={() => navigate('/admin/events')}
      />
    </div>
  );
}
