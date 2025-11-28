import { Notification } from 'electron';

export const showNotification = (title: string, body: string, success: boolean = true): void => {
  if (!Notification.isSupported()) {
    return;
  }

  new Notification({
    title,
    body,
    icon: success ? undefined : undefined, // Icon-Pfad später hinzufügen
    urgency: success ? 'normal' : 'critical',
  }).show();
};

