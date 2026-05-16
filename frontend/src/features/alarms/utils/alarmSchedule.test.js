const assert = require('node:assert/strict');

const { refreshStaleActiveTriggers } = require('./alarmSchedule');

const now = 1_000;
const nextTriggerAt = 5_000;
const calculateNextTriggerAt = () => nextTriggerAt;

const [activeStale, activeFuture, inactiveStale] = refreshStaleActiveTriggers(
  [
    {
      id: 'active-stale',
      hour: 7,
      isActive: true,
      minute: 30,
      nextTriggerAt: 900,
      period: 'AM',
      repeatDays: ['Mon'],
      updatedAt: 100,
    },
    {
      id: 'active-future',
      isActive: true,
      nextTriggerAt: 2_000,
    },
    {
      id: 'inactive-stale',
      isActive: false,
      nextTriggerAt: 900,
    },
  ],
  now,
  calculateNextTriggerAt,
);

assert.equal(activeStale.nextTriggerAt, nextTriggerAt);
assert.equal(activeStale.updatedAt, now);
assert.equal(activeFuture.nextTriggerAt, 2_000);
assert.equal(inactiveStale.nextTriggerAt, 900);

console.log('alarm schedule refresh rules passed');
