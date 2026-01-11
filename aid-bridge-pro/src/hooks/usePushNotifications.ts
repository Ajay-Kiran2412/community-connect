// src/hooks/usePushNotifications.ts
import { useEffect, useState } from 'react';
import {
  initializeMessaging,
  requestNotificationPermission,
  setupMessageListener,
  removeDeviceTokenFromBackend,
} from '@/services/firebaseMessaging';
import { useToast } from './use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Firebase Messaging on component mount
    const initializeNotifications = async () => {
      try {
        const supported = await initializeMessaging();
        setIsSupported(supported);

        if (supported) {
          // Setup listener for incoming messages
          setupMessageListener((message) => {
            console.log('Notification received:', message);
            const title = message.notification?.title || 'New Notification';
            const body = message.notification?.body || 'You have a new message';

            // Show toast notification when app is in foreground
            toast({
              title,
              description: body,
              duration: 5000,
            });
          });

          // Check if notifications are already enabled
          if (Notification.permission === 'granted') {
            setIsEnabled(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, [toast]);

  const enableNotifications = async () => {
    setLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setIsEnabled(true);
        toast({
          title: 'Success',
          description: 'Push notifications enabled',
          duration: 3000,
        });
      } else {
        setIsEnabled(false);
        toast({
          title: 'Permission Denied',
          description: 'Failed to enable push notifications',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable notifications',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async () => {
    setLoading(true);
    try {
      // Get stored device token from localStorage if available
      const deviceToken = localStorage.getItem('deviceToken');
      if (deviceToken) {
        await removeDeviceTokenFromBackend(deviceToken);
        localStorage.removeItem('deviceToken');
      }

      setIsEnabled(false);
      toast({
        title: 'Success',
        description: 'Push notifications disabled',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable notifications',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isEnabled,
    loading,
    enableNotifications,
    disableNotifications,
  };
};
