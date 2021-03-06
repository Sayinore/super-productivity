/// <reference lib="webworker" />

import { ReminderCopy } from './reminder.model';

const CHECK_INTERVAL_DURATION = 10000;
let checkInterval: any;

addEventListener('message', ({data}) => {
  // console.log('REMINDER WORKER', data);
  reInitCheckInterval(data);
});

const reInitCheckInterval = (reminders: ReminderCopy[]) => {
  if (checkInterval as any) {
    clearInterval(checkInterval as any);
  }
  if (!reminders || !reminders.length) {
    return;
  }

  checkInterval = setInterval(() => {
    const dueReminders = getDueReminders(reminders);
    if (dueReminders.length) {
      const oldest = dueReminders[0];

      const remindersToSend = (oldest.type === 'TASK')
        ? dueReminders.filter(r => r.type === 'TASK')
        // NOTE: for notes we just send the oldest due reminder
        : [oldest];

      postMessage(remindersToSend);
      console.log('Worker postMessage', remindersToSend);
    }
  }, CHECK_INTERVAL_DURATION);
};

const getDueReminders = (reminders: ReminderCopy[]): ReminderCopy[] => {
  const now = Date.now();
  return reminders
    .filter(reminder => (reminder.remindAt < now))
    .sort((a, b) => a.remindAt - b.remindAt);
};
