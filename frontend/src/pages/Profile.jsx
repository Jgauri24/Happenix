import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { User, Mail, MapPin, Save, Shield, Calendar } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      city: user?.location?.city || ''
    }
  });

  // Reset form when user data changes or editing starts
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        city: user.location?.city || ''
      });
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put('/users/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      // Update the auth store with the new user data
      updateUser(data.user);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries(['user']);
      queryClient.invalidateQueries(['auth', 'me']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
      console.error('Profile update error:', error);
    }
  });

  const onSubmit = (data) => {
    // Transform data to match backend expectations
    const updateData = {
      name: data.name,
      email: data.email,
      location: {
        city: data.city || ''
      }
    };
    updateProfileMutation.mutate(updateData);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: User Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 relative">
            <div className="h-32 bg-gradient-to-r from-primary-500 to-indigo-600"></div>

            <div className="px-6 pb-6 text-center -mt-16">
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-full bg-white dark:bg-gray-800 p-1 mx-auto shadow-lg overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-primary-600 dark:text-primary-400">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Camera/Upload removed as requested */}
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h2>
              <div className="flex items-center justify-center mt-2 space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>

              <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6 text-left space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm">Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Viewed (Mobile/Desktop Left) */}
          <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recently Viewed</h3>
            {user?.recentlyViewed?.length > 0 ? (
              <div className="space-y-4">
                {user.recentlyViewed.map((item, idx) => (
                  item.eventId && (
                    <a key={idx} href={`/events/${item.eventId._id || item.eventId}`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors group">
                      <div className="h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {item.eventId.title || 'Event'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.viewedAt ? format(new Date(item.viewedAt), 'MMM dd, HH:mm') : ''}
                        </p>
                      </div>
                    </a>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No events viewed yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Browse events to see them here</p>
              </div>
            )}
          </div>

          {/* Bookmarked Events */}
          <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Saved Events</h3>
            {user?.bookmarks?.length > 0 ? (
              <div className="space-y-4">
                {user.bookmarks.map((event, idx) => (
                  event && (
                    <a key={idx} href={`/events/${event._id || event}`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors group">
                      <div className="h-10 w-10 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <Save className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {event.title || 'Event'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {event.date ? format(new Date(event.date), 'MMM dd, yyyy') : ''}
                        </p>
                      </div>
                    </a>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Save className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No saved events yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Bookmark events to save them here</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Edit Details */}
        <div className="lg:col-span-2">
          <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary text-sm"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      disabled={!isEditing}
                      className={`input pl-10 w-full ${!isEditing && 'bg-gray-50 dark:bg-gray-900 border-transparent'}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      type="email"
                      disabled={!isEditing}
                      className={`input pl-10 w-full ${!isEditing && 'bg-gray-50 dark:bg-gray-900 border-transparent'}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('city')}
                      type="text"
                      placeholder="e.g. New York"
                      disabled={!isEditing}
                      className={`input pl-10 w-full ${!isEditing && 'bg-gray-50 dark:bg-gray-900 border-transparent'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={user?.role || 'User'}
                      disabled
                      className="input pl-10 w-full bg-gray-50 dark:bg-gray-900 border-transparent cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn btn-primary flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
