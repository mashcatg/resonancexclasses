import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface DeviceSession {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  is_active: boolean;
  is_approved: boolean;
  is_primary: boolean;
  created_at: string;
}

interface UseDeviceSessionReturn {
  deviceSession: DeviceSession | null;
  isBlocked: boolean;
  isLoading: boolean;
  checkDeviceSession: () => Promise<void>;
}

// Generate a simple device fingerprint
const generateFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fingerprint", 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join("|");

  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Get browser and OS info
const getBrowserInfo = (): { browser: string; os: string } => {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";

  // Detect browser
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera")) browser = "Opera";

  // Detect OS
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad"))
    os = "iOS";

  return { browser, os };
};

export const useDeviceSession = (
  user: User | null,
  isStudent: boolean
): UseDeviceSessionReturn => {
  const [deviceSession, setDeviceSession] = useState<DeviceSession | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkDeviceSession = useCallback(async () => {
    if (!user || !isStudent) {
      setIsLoading(false);
      setIsBlocked(false);
      return;
    }

    try {
      setIsLoading(true);
      const fingerprint = generateFingerprint();
      const { browser, os } = getBrowserInfo();
      const deviceName = `${browser} on ${os}`;

      // Check if this device already has a session
      const { data: existingSession, error: fetchError } = await supabase
        .from("device_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("device_fingerprint", fingerprint)
        .single();

      if (existingSession) {
        // Update last active
        await supabase
          .from("device_sessions")
          .update({ last_active_at: new Date().toISOString() })
          .eq("id", existingSession.id);

        setDeviceSession(existingSession);
        
        // Check if blocked (not approved and not primary)
        if (!existingSession.is_approved && !existingSession.is_primary) {
          // Check if there's another active approved device
          const { data: otherDevices } = await supabase
            .from("device_sessions")
            .select("*")
            .eq("user_id", user.id)
            .neq("id", existingSession.id)
            .or("is_approved.eq.true,is_primary.eq.true");

          if (otherDevices && otherDevices.length > 0) {
            setIsBlocked(true);
          } else {
            // This is the first device, auto-approve it as primary
            await supabase
              .from("device_sessions")
              .update({ is_approved: true, is_primary: true })
              .eq("id", existingSession.id);
            setIsBlocked(false);
          }
        } else {
          setIsBlocked(false);
        }
      } else if (fetchError?.code === "PGRST116") {
        // No session exists, create one
        // Check if user has any other devices
        const { data: existingDevices } = await supabase
          .from("device_sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true);

        const isFirstDevice = !existingDevices || existingDevices.length === 0;

        const { data: newSession, error: insertError } = await supabase
          .from("device_sessions")
          .insert({
            user_id: user.id,
            device_fingerprint: fingerprint,
            device_name: deviceName,
            browser,
            os,
            is_approved: isFirstDevice,
            is_primary: isFirstDevice,
          })
          .select()
          .single();

        if (!insertError && newSession) {
          setDeviceSession(newSession);
          setIsBlocked(!isFirstDevice);
        }
      }
    } catch (error) {
      console.error("Error checking device session:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isStudent]);

  useEffect(() => {
    checkDeviceSession();
  }, [checkDeviceSession]);

  return {
    deviceSession,
    isBlocked,
    isLoading,
    checkDeviceSession,
  };
};
