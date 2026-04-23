import Pusher from "pusher";
import { getUserChannelName, PUSHER_EVENTS } from "@/lib/pusher-shared";

export function hasPusherServerEnv() {
  return Boolean(
    process.env.PUSHER_APP_ID?.trim() &&
      process.env.NEXT_PUBLIC_PUSHER_KEY?.trim() &&
      process.env.PUSHER_SECRET?.trim() &&
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim()
  );
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

let pusherServer: Pusher | null = null;

export function getPusherServer() {
  if (!hasPusherServerEnv()) {
    return null;
  }

  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: getRequiredEnv("PUSHER_APP_ID"),
      key: getRequiredEnv("NEXT_PUBLIC_PUSHER_KEY"),
      secret: getRequiredEnv("PUSHER_SECRET"),
      cluster: getRequiredEnv("NEXT_PUBLIC_PUSHER_CLUSTER"),
      useTLS: true,
    });
  }

  return pusherServer;
}

export { getUserChannelName, PUSHER_EVENTS };
