/**
 * Enterprise Mobile & Connected Device Alert Dispatcher
 * For Oil India Limited Safety Intelligence Platform
 * 
 * Capabilities:
 * 1. Industrial Emergency Audio Synthesizer (Web Audio API - zero dependencies, offline, zero 404s)
 * 2. Mobile Haptic Vibration Pattern (Web Vibration API for connected phones)
 * 3. Native Device OS Notifications (Web Notification API)
 * 4. Background Webhook Dispatch for external mobile SMS / WhatsApp / n8n triggers
 */

// Singleton AudioContext to handle browser autoplay policies
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

/**
 * Play a high-urgency multi-tone industrial alert sound
 * Designed specifically for safety-critical plant alarm alerting.
 */
export const playEmergencyAlertSound = (type = 'recurring_sif') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, now);
    masterGain.connect(ctx.destination);

    // Beep Pattern: 3 rapid warning chirps followed by a continuous alert siren
    const freqs = type === 'recurring_sif' ? [880, 1320, 880, 1320, 1760] : [660, 880, 660];
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth'; // Piercing industrial buzzer tone
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
      
      gain.gain.setValueAtTime(0.001, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.35, now + idx * 0.18 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.15);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.16);
    });

    // Secondary Sub-Bass Resonance
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, now);
    subOsc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.linearRampToValueAtTime(0.001, now + 0.9);
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.9);

  } catch (err) {
    console.warn('Web Audio emergency alert playback failed (possibly blocked by browser policy):', err);
  }
};

/**
 * Trigger connected mobile device vibration
 * @param {Array<number>} pattern - e.g. [400, 150, 400, 150, 600]
 */
export const triggerMobileVibration = (pattern = [400, 150, 400, 150, 600]) => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
      return true;
    }
  } catch (err) {
    console.warn('Mobile vibration API not supported or blocked:', err);
  }
  return false;
};

/**
 * Request OS Notification Permission
 */
export const requestDeviceNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    return 'denied';
  }
};

/**
 * Dispatch Native OS & Mobile Device Push Notification
 */
export const dispatchDeviceNotification = ({
  title = '🚨 CRITICAL RECURRING SIF ALERT',
  body = 'Multiple recurring failure precursors detected for this asset!',
  asset = '',
  count = 2,
}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: `${body} (${count} previous precursor incidents recorded for ${asset || 'this asset'}). Immediate field inspection mandated under DGMS rules.`,
        icon: '/vite.svg',
        tag: `sif-recurring-${asset || 'hazard'}-${Date.now()}`,
        requireInteraction: true,
        vibrate: [400, 150, 400, 150, 600],
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (err) {
      console.warn('Failed to fire device notification:', err);
    }
  } else if (Notification.permission !== 'denied') {
    requestDeviceNotificationPermission().then(perm => {
      if (perm === 'granted') {
        dispatchDeviceNotification({ title, body, asset, count });
      }
    });
  }
  return false;
};

/**
 * Master Connected Device Alert Trigger
 * Fires sound + mobile vibration + native notification + optional backend webhook
 */
export const triggerConnectedDeviceAlert = ({
  asset = 'Facility Asset',
  count = 2,
  narrative = '',
  location = 'Oil India Facility',
  department = 'Operations',
}) => {
  console.log(`[DEVICE ALERT] Triggering connected device emergency alert for asset: ${asset} (${count} occurrences)`);

  // 1. Play Emergency Siren Sound on device
  playEmergencyAlertSound('recurring_sif');

  // 2. Mobile Haptic Vibration
  triggerMobileVibration([400, 150, 400, 150, 700]);

  // 3. Dispatch Native Push Notification to Connected Mobile Device
  dispatchDeviceNotification({
    title: `🚨 RECURRING SIF PRECURSOR: ${asset}`,
    body: `Hazard recurring ${count} times!`,
    asset,
    count,
  });

  // 4. Background Webhook Trigger to n8n / mobile SMS gateway if configured
  try {
    const API_BASE = (import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
    fetch(`${API_BASE}/api/agent/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        observation: `EMERGENCY RECURRING PRECURSOR: ${asset} has experienced ${count} repeated SIF incidents! Narrative: "${narrative.slice(0, 140)}"`,
        location,
        department,
      })
    }).catch(() => {});
  } catch (ex) {
    // Non-blocking
  }

  return {
    alertDispatched: true,
    timestamp: new Date().toISOString(),
    asset,
    recurringCount: count,
  };
};

export default {
  playEmergencyAlertSound,
  triggerMobileVibration,
  requestDeviceNotificationPermission,
  dispatchDeviceNotification,
  triggerConnectedDeviceAlert,
};
