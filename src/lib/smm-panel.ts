interface SmmService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  dripfeed: boolean;
  refill: boolean;
  cancel: boolean;
}

interface OrderResult {
  order: number;
}

interface OrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

interface BalanceResult {
  balance: string;
  currency: string;
}

export class SmmPanelClient {
  constructor(
    private panelUrl: string,
    private apiKey: string
  ) {}

  private async post(action: string, params: Record<string, string | number> = {}) {
    const body = new URLSearchParams({ key: this.apiKey, action });
    for (const [k, v] of Object.entries(params)) {
      body.append(k, String(v));
    }
    const res = await fetch(this.panelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) throw new Error(`Panel API error: ${res.status}`);
    return res.json();
  }

  async services(): Promise<SmmService[]> {
    return this.post('services');
  }

  async balance(): Promise<BalanceResult> {
    return this.post('balance');
  }

  async addOrder(service: number, link: string, quantity: number): Promise<OrderResult> {
    return this.post('add', { service, link, quantity });
  }

  async addCustomComments(service: number, link: string, quantity: number, comments: string): Promise<OrderResult> {
    return this.post('add', { service, link, quantity, comments });
  }

  async addDripfeed(service: number, link: string, quantity: number, runs: number, interval: number): Promise<OrderResult> {
    return this.post('add', { service, link, quantity, runs, interval });
  }

  async orderStatus(orderId: number): Promise<OrderStatus> {
    return this.post('status', { order: orderId });
  }

  async multiStatus(orderIds: number[]): Promise<Record<string, OrderStatus>> {
    return this.post('status', { orders: orderIds.join(',') });
  }

  async refill(orderId: number): Promise<{ refill: number }> {
    return this.post('refill', { order: orderId });
  }

  async refillStatus(refillId: number): Promise<{ status: string }> {
    return this.post('refill_status', { refill: refillId });
  }

  async cancel(orderIds: number[]): Promise<Array<{ order: number; cancel: number | { error: string } }>> {
    return this.post('cancel', { orders: orderIds.join(',') });
  }
}
