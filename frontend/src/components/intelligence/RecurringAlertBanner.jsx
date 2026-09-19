import React, { useState } from 'react';
import { AlertTriangle, Volume2, Vibrate, Bell, ShieldAlert, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { playEmergencyAlertSound, triggerMobileVibration, requestDeviceNotificationPermission } from '../../utils/deviceAlert';

export const RecurringAlertBanner = ({
  asset = 'Facility Asset',
  repeatCount = 2,
  narrative = '',
  location = 'Oil India Field Site',
  department = 'Operations',
  onDismiss = null,
}) => {
  const [soundPlayed, setSoundPlayed] = useState(true);
  const [notificationPerm, setNotificationPerm] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleReplaySound = () => {
    playEmergencyAlertSound('recurring_sif');
    setSoundPlayed(true);
  };

  const handleVibrateMobile = () => {
    const success = triggerMobileVibration([300, 100, 300, 100, 500]);
    if (!success) {
      alert("Mobile vibration is active on mobile devices and supported browsers.");
    }
  };

  const handleEnableNotifications = async () => {
    const perm = await requestDeviceNotificationPermission();
    setNotificationPerm(perm);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/80 bg-gradient-to-br from-red-950/90 via-slate-900 to-amber-950/80 text-white p-6 shadow-[0_12px_40px_rgba(239,68,68,0.25)] animate-pulse-slow">
      {/* Background Warning Glow Elements */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Badge & Title */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/30 border border-red-400/50 text-red-200 text-xs font-black tracking-wide uppercase animate-bounce">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              🚨 Critical Alert
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-extrabold">
              Repeat Incident Pattern Detected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              Dispatched to Connected Device
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          </div>
        </div>

        {/* Main Alert Message */}
        <div className="space-y-1.5">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-red-400 shrink-0" />
            <span>Recurring SIF Precursor Pattern — {asset}</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
            This incident matches <strong className="text-red-300 underline font-extrabold">{repeatCount} prior precursor events</strong> logged for <strong>{asset}</strong> at <em>{location}</em>. 
            Under DGMS (Oil Mines Regulations 2017) and OISD standards, recurring asset precursors require immediate lock-out verification, barrier inspection, and statutory CAPA logging.
          </p>
        </div>

        {/* Device Notification Status Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Alarm Siren Dispatched</div>
              <div className="text-[10px] text-slate-400">Audible 3-tone industrial alert</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Vibrate className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Mobile Vibration Active</div>
              <div className="text-[10px] text-slate-400">Haptic pulse pattern sent to phone</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">
                {notificationPerm === 'granted' ? 'Mobile Push Enabled' : 'Device Push Available'}
              </div>
              <div className="text-[10px] text-slate-400">
                {notificationPerm === 'granted' ? 'Native lockscreen alert fired' : 'Click below to allow notifications'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReplaySound}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Replay Alert Siren</span>
            </button>

            <button
              type="button"
              onClick={handleVibrateMobile}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Vibrate className="w-4 h-4 text-red-400" />
              <span>Vibrate Mobile Device</span>
            </button>

            {notificationPerm !== 'granted' && (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Allow Phone Lockscreen Alerts</span>
              </button>
            )}
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-slate-400 hover:text-white font-medium underline underline-offset-4 cursor-pointer"
            >
              Acknowledge & Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecurringAlertBanner;
