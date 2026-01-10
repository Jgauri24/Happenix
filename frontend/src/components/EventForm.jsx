import { CATEGORIES } from '../utils/constants';

/**
 * Shared form component for creating and editing events
 */
export default function EventForm({ formData, setFormData, poster, setPoster, onSubmit, isSubmitting, submitLabel, onCancel }) {
    const isOnline = formData.type === 'online';

    return (
        <form onSubmit={onSubmit} className="card space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium mb-2">Event Title *</label>
                <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                    className="input"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            {/* Category and Type */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                        className="input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Event Type *</label>
                    <select
                        className="input"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                    >
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                    </select>
                </div>
            </div>

            {/* Status (only for edit) */}
            {formData.status !== undefined && (
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Status *</label>
                        <select
                            className="input"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Date, Time, Duration */}
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <input
                        type="date"
                        className="input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Time *</label>
                    <input
                        type="time"
                        className="input"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Location fields (offline) or Online link */}
            {!isOnline ? (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Location Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Central Park"
                            value={formData.locationName}
                            onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Full address for geocoding"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                className="input"
                                placeholder="e.g., 40.7128"
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                className="input"
                                placeholder="e.g., -74.0060"
                                value={formData.lng}
                                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div>
                    <label className="block text-sm font-medium mb-2">Online Link *</label>
                    <input
                        type="url"
                        className="input"
                        placeholder="https://meet.google.com/..."
                        value={formData.onlineLink}
                        onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
                        required={isOnline}
                    />
                </div>
            )}

            {/* Price and Max Attendees */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Price ($) *</label>
                    <input
                        type="number"
                        className="input"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Max Attendees</label>
                    <input
                        type="number"
                        className="input"
                        placeholder="Leave empty for unlimited"
                        value={formData.maxAttendees}
                        onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    />
                </div>
            </div>

            {/* Poster Image */}
            <div>
                <label className="block text-sm font-medium mb-2">Poster Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPoster(e.target.files[0])}
                    className="input"
                />
                {formData.poster && !poster && (
                    <p className="text-sm text-gray-500 mt-2">Current: {formData.poster}</p>
                )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                >
                    {isSubmitting ? 'Saving...' : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
