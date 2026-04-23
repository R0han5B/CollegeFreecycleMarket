export function getUserChannelName(userId: string) {
  return `user-${userId}`;
}

export const PUSHER_EVENTS = {
  messageCreated: "message-created",
} as const;
