import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';

export function NotificationSettings() {
  const {
    isSupported,
    isEnabled,
    loading,
    enableNotifications,
    disableNotifications,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Push notifications are not supported in your browser.
            Try using Chrome, Firefox, Safari, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {isEnabled ? 'Enabled ✓' : 'Disabled'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isEnabled
                ? 'You will receive notifications when new posts are created'
                : 'You will not receive notifications'}
            </p>
          </div>
          <div className="ml-4">
            {isEnabled ? (
              <BellOff className="w-6 h-6 text-gray-400" />
            ) : (
              <Bell className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>

        {isEnabled ? (
          <Button
            onClick={disableNotifications}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? 'Disabling...' : 'Disable Notifications'}
          </Button>
        ) : (
          <Button
            onClick={enableNotifications}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        )}

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>💡 Tip:</strong> When enabled, you'll receive notifications
            on your phone or desktop whenever someone posts in your community.
            You'll need to allow notifications in your browser first.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
