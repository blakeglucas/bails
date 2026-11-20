import { On, Off, OffAll, OnMultiple, BailsEvent, Once } from './events';
import { eventListeners } from "./listener";
import { expect, describe, it, vi, afterEach, beforeEach } from 'vitest';

const dispatchBailsEvent = window._bails.dispatchBailsEvent;

afterEach(() => {
  OffAll();
  vi.resetAllMocks();
});

describe("OnMultiple", () => {
  const testEvent = { name: 'a', data: ["hello", "events"] };
  const cb = vi.fn((ev) => {
    expect(ev).toBeInstanceOf(BailsEvent);
    expect(ev).toMatchObject(testEvent);
  });

  it("should dispatch a properly initialised BailsEvent", () => {
    OnMultiple('a', cb, 5);
    dispatchBailsEvent(testEvent);
    expect(cb).toHaveBeenCalled();
  });

  it("should stop after the specified number of times", () => {
    OnMultiple('a', cb, 5);
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    expect(cb).toHaveBeenCalledTimes(5);
  });

  it("should return a cancel fn", () => {
    const cancel = OnMultiple('a', cb, 5);
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    cancel();
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    expect(cb).toBeCalledTimes(2);
  });
});

describe("On", () => {
  let testEvent = { name: 'a', data: ["hello", "events"], sender: "window" };
  const cb = vi.fn((ev) => {
    expect(ev).toBeInstanceOf(BailsEvent);
    expect(ev).toMatchObject(testEvent);
  });

  it("should dispatch a properly initialised BailsEvent", () => {
    On('a', cb);
    dispatchBailsEvent(testEvent);
    expect(cb).toHaveBeenCalled();
  });

  it("should never stop", () => {
    On('a', cb);
    expect(eventListeners.get('a')[0].maxCallbacks).toBe(-1);
    dispatchBailsEvent(testEvent);
    expect(eventListeners.get('a')[0].maxCallbacks).toBe(-1);
  });

  it("should return a cancel fn", () => {
    const cancel = On('a', cb)
    dispatchBailsEvent(testEvent);
    cancel();
    dispatchBailsEvent(testEvent);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe("Once", () => {
  const testEvent = { name: 'a', data: ["hello", "events"] };
  const cb = vi.fn((ev) => {
    expect(ev).toBeInstanceOf(BailsEvent);
    expect(ev).toMatchObject(testEvent);
  });

  it("should dispatch a properly initialised BailsEvent", () => {
    Once('a', cb);
    dispatchBailsEvent(testEvent);
    expect(cb).toHaveBeenCalled();
  });

  it("should stop after one time", () => {
    Once('a', cb)
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    dispatchBailsEvent(testEvent);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("should return a cancel fn", () => {
    const cancel = Once('a', cb)
    cancel();
    dispatchBailsEvent(testEvent);
    expect(cb).not.toHaveBeenCalled();
  });
})

describe("Off", () => {
  const cba = vi.fn(), cbb = vi.fn(), cbc = vi.fn();

  beforeEach(() => {
    On('a', cba);
    On('a', cba);
    On('a', cba);
    On('b', cbb);
    On('c', cbc);
    On('c', cbc);
  });

  it("should cancel all event listeners for a single type", () => {
    Off('a');
    dispatchBailsEvent({ name: 'a' });
    dispatchBailsEvent({ name: 'b' });
    dispatchBailsEvent({ name: 'c' });
    expect(cba).not.toHaveBeenCalled();
    expect(cbb).toHaveBeenCalledTimes(1);
    expect(cbc).toHaveBeenCalledTimes(2);
  });

  it("should cancel all event listeners for multiple types", () => {
    Off('a', 'c')
    dispatchBailsEvent({ name: 'a' });
    dispatchBailsEvent({ name: 'b' });
    dispatchBailsEvent({ name: 'c' });
    expect(cba).not.toHaveBeenCalled();
    expect(cbb).toHaveBeenCalledTimes(1);
    expect(cbc).not.toHaveBeenCalled();
  });
});

describe("OffAll", () => {
  it("should cancel all event listeners", () => {
    const cba = vi.fn(), cbb = vi.fn(), cbc = vi.fn();
    On('a', cba);
    On('a', cba);
    On('a', cba);
    On('b', cbb);
    On('c', cbc);
    On('c', cbc);
    OffAll();
    dispatchBailsEvent({ name: 'a' });
    dispatchBailsEvent({ name: 'b' });
    dispatchBailsEvent({ name: 'c' });
    expect(cba).not.toHaveBeenCalled();
    expect(cbb).not.toHaveBeenCalled();
    expect(cbc).not.toHaveBeenCalled();
  });
});
