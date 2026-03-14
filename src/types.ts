export interface NotifyOptions {
  title: string;
  message: string;
  subtitle?: string;
  icon?: string;
  sound?: boolean | string;
  timeout?: number;
  actions?: string[];
  wait?: boolean;
  appId?: string;
  urgency?: "low" | "normal" | "critical";
}

export interface NotificationResult {
  success: boolean;
  action?: string;
  error?: Error;
}

export interface INotifier {
  notify(options: NotifyOptions): Promise<NotificationResult>;
}
