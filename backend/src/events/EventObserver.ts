export type EventType = string;

export interface Event {
  type: EventType;
  data: any;
}

export class EventObserver {
  static instance: EventObserver = new EventObserver();
  static getInstance() {
    return EventObserver.instance;
  }

  private observers: Map<EventType, Function[]> = new Map();
  private constructor() {}

  subscribe(event: EventType, callback: Function) {
    if (!this.observers.has(event)) {
      this.observers.set(event, []);
    }
    this.observers.get(event)?.push(callback);
  }

  emit(event: Event) {
    this.observers.get(event.type)?.forEach((callback) => callback(event.data));
  }
}
