export function logClientEvent(scope, event, details = {}) {
  console.info(`[${scope}] ${event}`, details);
}

export function warnClientEvent(scope, event, details = {}) {
  console.warn(`[${scope}] ${event}`, details);
}
