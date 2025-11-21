// This file creates a simple event emitter that can be used to broadcast
// and listen for events across the application. It's a lightweight way
// to handle cross-component communication without complex state management.

type Listener = (data: any) => void;
type Listeners = { [key: string]: Listener[] };

class EventEmitter {
  private listeners: Listeners = {};

  // Subscribe to an event
  on(event: string, listener: Listener): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  // Unsubscribe from an event
  off(event: string, listener: Listener): void {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  // Publish an event
  emit(event: string, data: any): void {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(listener => listener(data));
  }
}

// Export a singleton instance of the event emitter.
export const errorEmitter = new EventEmitter();
