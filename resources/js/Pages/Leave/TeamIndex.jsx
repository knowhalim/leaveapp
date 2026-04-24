import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Eye, Paperclip } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function LeaveTeamIndex({ leaveRequests, leaveTypes, filters }) {
    const handleFilterChange = (key, value) => {
        router.get('/leaves/team', { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout title="Team Leave Requests">
            <Head title="Team Leave Requests" />

            <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                    <select
                        value={filters?.status || 'all'}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        value={filters?.leave_type || 'all'}
                        onChange={(e) => handleFilterChange('leave_type', e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    >
                        <option value="all">All Leave Types</option>
                        {leaveTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leaveRequests.data.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No team leave requests found
                                </td>
                            </tr>
                        ) : (
                            leaveRequests.data.map((request) => (
                                <tr key={request.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {request.employee?.user?.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {request.employee?.department?.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: request.leave_type?.color }}
                                            />
                                            <span className="text-sm text-gray-900">{request.leave_type?.name}</span>
                                            {request.attachment_path && (
                                                <Paperclip className="h-3.5 w-3.5 text-gray-400" title="Has attachment" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {request.total_days}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/leaves/${request.id}`}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {leaveRequests.last_page > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="text-sm text-gray-700">
                            Showing {leaveRequests.from} to {leaveRequests.to} of {leaveRequests.total} results
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {leaveRequests.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3 py-1 text-sm rounded border ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} ${!link.url ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
