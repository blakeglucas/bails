/*
 _	   __	  _ __
| |	 / /___ _(_) /____
| | /| / / __ `/ / / ___/
| |/ |/ / /_/ / / (__  )
|__/|__/\__,_/_/_/____/
The electron alternative for Go
(c) Lea Anthony 2019-present
*/

import { newRuntimeCaller, objectNames } from "./runtime.js";
import { eventListeners, Listener, listenerOff } from "./listener.js";
import { Events as Create } from "./create.js";
import { Types } from "./event_types.js";

// Setup
import { hasDOM } from "./environment.js";

if (hasDOM) {
    window._bails = window._bails || {};
    window._bails.dispatchBailsEvent = dispatchBailsEvent;
}

const call = newRuntimeCaller(objectNames.Events);
const EmitMethod = 0;

export * from "./event_types.js";

/**
 * A table of data types for all known events.
 * Will be monkey-patched by the binding generator.
 */
export interface CustomEvents {}

/**
 * Either a known event name or an arbitrary string.
 */
export type BailsEventName<E extends keyof CustomEvents = keyof CustomEvents> = E | (string & {});

/**
 * Union of all known system event names.
 */
type SystemEventName = {
    [K in keyof (typeof Types)]: (typeof Types)[K][keyof ((typeof Types)[K])]
} extends (infer M) ? M[keyof M] : never;

/**
 * The data type associated to a given event.
 */
export type BailsEventData<E extends BailsEventName = BailsEventName> =
    E extends keyof CustomEvents ? CustomEvents[E] : (E extends SystemEventName ? void : any);

/**
 * The type of handlers for a given event.
 */
export type BailsEventCallback<E extends BailsEventName = BailsEventName> = (ev: BailsEvent<E>) => void;

/**
 * Represents a system event or a custom event emitted through bails-provided facilities.
 */
export class BailsEvent<E extends BailsEventName = BailsEventName> {
    /**
     * The name of the event.
     */
    name: E;

    /**
     * Optional data associated with the emitted event.
     */
    data: BailsEventData<E>;

    /**
     * Name of the originating window. Omitted for application events.
     * Will be overridden if set manually.
     */
    sender?: string;

    constructor(name: E, data: BailsEventData<E>);
    constructor(name: BailsEventData<E> extends null | void ? E : never)
    constructor(name: E, data?: any) {
        this.name = name;
        this.data = data ?? null;
    }
}

function dispatchBailsEvent(event: any) {
    let listeners = eventListeners.get(event.name);
    if (!listeners) {
        return;
    }

    let bailsEvent = new BailsEvent(
        event.name,
        (event.name in Create) ? Create[event.name](event.data) : event.data
    );
    if ('sender' in event) {
        bailsEvent.sender = event.sender;
    }

    // Dispatch to a snapshot, then remove all expired listeners in a single
    // post-dispatch filter of the live map.
    // - Writing the snapshot back wholesale would undo subscription changes
    //   made inside a handler (#4393).
    // - Calling listenerOff() per expired listener inside the loop is O(n²)
    //   when many listeners expire on the same event.
    // Filtering the live array once after dispatch is O(n) and still honours
    // any listeners added or removed by handlers during dispatch.
    const expired = new Set<Listener>();
    for (const listener of listeners.slice()) {
        if (listener.dispatch(bailsEvent)) {
            expired.add(listener);
        }
    }
    if (expired.size > 0) {
        const live = eventListeners.get(event.name);
        if (live) {
            const remaining = live.filter(l => !expired.has(l));
            if (remaining.length === 0) {
                eventListeners.delete(event.name);
            } else {
                eventListeners.set(event.name, remaining);
            }
        }
    }
}

/**
 * Register a callback function to be called multiple times for a specific event.
 *
 * @param eventName - The name of the event to register the callback for.
 * @param callback - The callback function to be called when the event is triggered.
 * @param maxCallbacks - The maximum number of times the callback can be called for the event. Once the maximum number is reached, the callback will no longer be called.
 * @returns A function that, when called, will unregister the callback from the event.
 */
export function OnMultiple<E extends BailsEventName = BailsEventName>(eventName: E, callback: BailsEventCallback<E>, maxCallbacks: number) {
    let listeners = eventListeners.get(eventName) || [];
    const thisListener = new Listener(eventName, callback, maxCallbacks);
    listeners.push(thisListener);
    eventListeners.set(eventName, listeners);
    return () => listenerOff(thisListener);
}

/**
 * Registers a callback function to be executed when the specified event occurs.
 *
 * @param eventName - The name of the event to register the callback for.
 * @param callback - The callback function to be called when the event is triggered.
 * @returns A function that, when called, will unregister the callback from the event.
 */
export function On<E extends BailsEventName = BailsEventName>(eventName: E, callback: BailsEventCallback<E>): () => void {
    return OnMultiple(eventName, callback, -1);
}

/**
 * Registers a callback function to be executed only once for the specified event.
 *
 * @param eventName - The name of the event to register the callback for.
 * @param callback - The callback function to be called when the event is triggered.
 * @returns A function that, when called, will unregister the callback from the event.
 */
export function Once<E extends BailsEventName = BailsEventName>(eventName: E, callback: BailsEventCallback<E>): () => void {
    return OnMultiple(eventName, callback, 1);
}

/**
 * Removes event listeners for the specified event names.
 *
 * @param eventNames - The name of the events to remove listeners for.
 */
export function Off(...eventNames: [BailsEventName, ...BailsEventName[]]): void {
    eventNames.forEach(eventName => eventListeners.delete(eventName));
}

/**
 * Removes all event listeners.
 */
export function OffAll(): void {
    eventListeners.clear();
}

/**
 * Emits an event.
 *
 * @returns A promise that will be fulfilled once the event has been emitted.  Resolves to true if the event was cancelled.
 * @param name - The name of the event to emit
 * @param data - The data that will be sent with the event
 */
export function Emit<E extends BailsEventName = BailsEventName>(name: E, data: BailsEventData<E>): Promise<boolean>
export function Emit<E extends BailsEventName = BailsEventName>(name: BailsEventData<E> extends null | void ? E : never): Promise<boolean>
export function Emit<E extends BailsEventName = BailsEventName>(name: BailsEventData<E>, data?: any): Promise<boolean> {
    return call(EmitMethod,  new BailsEvent(name, data))
}

