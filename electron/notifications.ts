import { Notification } from 'electron';

export const showNotification = (title: string, body: string, success: boolean = true): void => {
  if (!Notification.isSupported()) {
    console.warn('[Notifications] Notifications not supported on this platform');
    return;
  }

  try {
    const notification = new Notification({
      title,
      body,
      urgency: success ? 'normal' : 'critical',
    });
    
    // Auf macOS muss show() explizit aufgerufen werden, um die Benachrichtigung anzuzeigen
    notification.show();
    
    console.log(`[Notifications] Notification shown: ${title} - ${body}`);
  } catch (error) {
    console.error('[Notifications] Error showing notification:', error);
  }
};

