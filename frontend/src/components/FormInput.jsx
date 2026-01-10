export default function FormInput({
    label,
    icon: Icon,
    error,
    required = false,
    className = '',
    ...props
}) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {required && '*'}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                )}
                <input
                    className={`input w-full ${Icon ? 'pl-10' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
