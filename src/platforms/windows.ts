import { execFile } from "node:child_process";
import type { INotifier, NotifyOptions, NotificationResult } from "../types.js";
import { escapePowerShellArg } from "../utils/escape.js";

export class WindowsBalloon implements INotifier {
  async notify(options: NotifyOptions): Promise<NotificationResult> {
    const script = buildPowerShellScript(options);
    return new Promise<NotificationResult>((resolve) => {
      execFile(
        "powershell",
        ["-NoProfile", "-NonInteractive", "-Command", script],
        (error) => {
          if (error) {
            resolve({ success: false, error });
          } else {
            resolve({ success: true });
          }
        }
      );
    });
  }
}

function buildPowerShellScript(options: NotifyOptions): string {
  const title = escapePowerShellArg(options.title);
  const message = escapePowerShellArg(options.message);
  const appId = options.appId
    ? escapePowerShellArg(options.appId)
    : "herald";

  // Try BurntToast first, fall back to WinRT toast
  const burntToast = buildBurntToastScript(title, message, options);
  const winrt = buildWinRTScript(title, message, appId);

  return (
    `try { if (Get-Module -ListAvailable -Name BurntToast) { ${burntToast} } ` +
    `else { ${winrt} } } catch { ${winrt} }`
  );
}

function buildBurntToastScript(
  title: string,
  message: string,
  options: NotifyOptions
): string {
  let cmd = `New-BurntToastNotification -Text "${title}", "${message}"`;
  if (options.sound === false) {
    cmd += " -Silent";
  }
  return cmd;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildWinRTScript(
  title: string,
  message: string,
  appId: string
): string {
  const xmlTitle = escapeXml(title);
  const xmlMessage = escapeXml(message);
  return [
    `[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null;`,
    `[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null;`,
    `$xml = New-Object Windows.Data.Xml.Dom.XmlDocument;`,
    `$template = '<toast><visual><binding template="ToastText02"><text id="1">${xmlTitle}</text><text id="2">${xmlMessage}</text></binding></visual></toast>';`,
    `$xml.LoadXml($template);`,
    `$toast = [Windows.UI.Notifications.ToastNotification]::new($xml);`,
    `[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("${appId}").Show($toast)`,
  ].join(" ");
}

export { buildPowerShellScript as _buildPowerShellScript };
