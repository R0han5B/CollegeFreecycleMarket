"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

export function hasPusherClientEnv() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY?.trim();
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim();

  return Boolean(key && cluster);
}

export function getPusherClient() {
  if (!hasPusherClientEnv()) {
    return null;
  }

  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY?.trim();
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim();

    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
  }

  return pusherClient;
}
