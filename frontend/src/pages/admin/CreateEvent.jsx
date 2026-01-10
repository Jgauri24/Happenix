import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import EventForm from '../../components/EventForm';

export default function CreateEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    lat: '',
    lng: ''
  });

  const [poster, setPoster] = useState(null);

  const createMutation = useMutation({
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

      const res = await api.post('/events', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries(['admin', 'events']);
      navigate('/admin/events');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Create Event</h1>

      <EventForm
        formData={formData}
        setFormData={setFormData}
        poster={poster}
        setPoster={setPoster}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="Create Event"
        onCancel={() => navigate('/admin/events')}
      />
    </div>
  );
}

