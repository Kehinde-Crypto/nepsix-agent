import { getTriggers, updateTriggerStatus } from '../triggers/store';
import { defaultWhatsAppAdapter } from '../whatsapp/adapter';
import { addDeliveryLog } from '../whatsapp/logger';
import { CalendarTrigger } from '@/types';

export interface SchedulerExecutionResult {
  evaluated: number;
  dispatched: number;
  details: {
    triggerId: string;
    eventTitle: string;
    target: string;
    status: 'sent' | 'failed';
    error?: string;
  }[];
}

export async function runSchedulerConditionCheck(forceTriggerId?: string): Promise<SchedulerExecutionResult> {
  const triggers = getTriggers();
  const now = Date.now();
  const results: SchedulerExecutionResult = {
    evaluated: triggers.length,
    dispatched: 0,
    details: [],
  };

  for (const trigger of triggers) {
    const isDue = new Date(trigger.scheduledTime).getTime() <= now + 30000; // Due within 30s or earlier
    const isTargeted = forceTriggerId ? trigger.id === forceTriggerId : false;

    if ((trigger.status === 'pending' && isDue) || isTargeted) {
      const isGroup = trigger.recipient.type === 'group';
      const target = isGroup ? (trigger.recipient.jid || trigger.recipient.name) : (trigger.recipient.phone || trigger.recipient.name);

      try {
        const sendResult = await defaultWhatsAppAdapter.sendMessage(
          target,
          trigger.renderedMessage,
          isGroup
        );

        if (sendResult.success) {
          updateTriggerStatus(trigger.id, 'sent');
          addDeliveryLog({
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            triggerId: trigger.id,
            recipientName: trigger.recipient.name,
            recipientTarget: target,
            targetType: trigger.recipient.type,
            content: trigger.renderedMessage,
            sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
          });

          results.dispatched += 1;
          results.details.push({
            triggerId: trigger.id,
            eventTitle: trigger.eventTitle,
            target,
            status: 'sent',
          });
        } else {
          updateTriggerStatus(trigger.id, 'failed');
          results.details.push({
            triggerId: trigger.id,
            eventTitle: trigger.eventTitle,
            target,
            status: 'failed',
            error: sendResult.error,
          });
        }
      } catch (err: any) {
        updateTriggerStatus(trigger.id, 'failed');
        results.details.push({
          triggerId: trigger.id,
          eventTitle: trigger.eventTitle,
          target,
          status: 'failed',
          error: err.message,
        });
      }
    }
  }

  return results;
}
