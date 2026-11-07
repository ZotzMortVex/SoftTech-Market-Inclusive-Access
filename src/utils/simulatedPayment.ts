export const SIMULATED_PAYMENT_DEMO_CREDENTIALS = {
  email: "demo@pagos.test",
  password: "DemoPago2026!",
  startingBalance: 5_000_000,
} as const;

export const SIMULATED_PAYMENT_NO_FUNDS_CREDENTIALS = {
  email: "sin-saldo@pagos.test",
  password: "SinSaldo2026!",
  startingBalance: 0,
} as const;

export interface SimulatedPaymentCredentials {
  email: string;
  password: string;
}

export interface SimulatedPaymentReceipt {
  paymentId: string;
  subtotal: number;
  tax: number;
  amount: number;
  balanceAfter: number;
  simulated: true;
}
