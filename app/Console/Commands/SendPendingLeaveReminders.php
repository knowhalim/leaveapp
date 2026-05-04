<?php

namespace App\Console\Commands;

use App\Models\LeaveRequest;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Console\Command;

class SendPendingLeaveReminders extends Command
{
    protected $signature = 'app:send-pending-leave-reminders';
    protected $description = 'Remind supervisors of pending leave, then escalate to admins after configured day thresholds';

    public function handle(EmailService $emailService): void
    {
        $reminderDays = (int) SystemSetting::get('pending_reminder_days', 3);
        $escalationDays = (int) SystemSetting::get('pending_escalation_days', 4);

        // Reminder day+: remind supervisors if not yet reminded
        $toRemind = LeaveRequest::with(['employee.user', 'employee.supervisors.user', 'employee.department.manager', 'leaveType'])
            ->pending()
            ->where('created_at', '<=', now()->subDays($reminderDays))
            ->whereNull('reminder_sent_at')
            ->get();

        foreach ($toRemind as $leave) {
            $emailService->sendPendingLeaveReminder($leave);
            $leave->update(['reminder_sent_at' => now()]);
            $this->info("Reminder sent for leave #{$leave->id} ({$leave->employee->user->name})");
        }

        // Escalation day+: escalate to admins if reminder was sent but still pending
        $toEscalate = LeaveRequest::with(['employee.user', 'leaveType'])
            ->pending()
            ->where('created_at', '<=', now()->subDays($escalationDays))
            ->whereNotNull('reminder_sent_at')
            ->whereNull('admin_notified_at')
            ->get();

        foreach ($toEscalate as $leave) {
            $emailService->sendPendingLeaveAdminEscalation($leave);
            $leave->update(['admin_notified_at' => now()]);
            $this->info("Admin escalation sent for leave #{$leave->id} ({$leave->employee->user->name})");
        }

        $this->info('Done.');
    }
}
