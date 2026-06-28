import { BASE_URL } from './api';
import { useAuthStore } from './auth-store';

type WsHandler = (data: unknown) => void;

class WsClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<WsHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private maxAttempts = 10;
  private destroyed = false;

  private getUrl(): string | null {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    return BASE_URL.replace(/^http/, 'ws') + '/ws?token=' + token;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.destroyed = false;

    const url = this.getUrl();
    if (!url) return;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.attempts = 0;
    };

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string);
        const set = this.handlers.get(msg.event);
        if (set) set.forEach((fn) => fn(msg.data));
      } catch {}
    };

    this.ws.onclose = () => {
      if (!this.destroyed) this.scheduleReconnect();
    };

    this.ws.onerror = () => {};
  }

  private scheduleReconnect() {
    if (this.attempts >= this.maxAttempts) return;
    const delay = Math.min(1000 * 2 ** this.attempts, 30000);
    this.attempts++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  disconnect() {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  on(event: string, handler: WsHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: WsHandler) {
    this.handlers.get(event)?.delete(handler);
  }
}

export const ws = new WsClient();
