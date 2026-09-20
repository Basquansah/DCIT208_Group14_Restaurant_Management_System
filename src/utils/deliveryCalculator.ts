export interface DeliveryParams {
  fulfillment: 'PICKUP' | 'DELIVERY';
  distanceKm?: number;
  foodSubtotal: number;
}

export interface PricingBreakdown {
  foodSubtotal: number;
  deliveryFee: number;
  totalAmount: number;
}

export function calculateOrderPricing(params: DeliveryParams): PricingBreakdown {
  const { foodSubtotal } = params;

  if (foodSubtotal < 0) {
    throw new Error('Food subtotal cannot be negative.');
  }

  return {
    foodSubtotal,
    deliveryFee: 0.00,
    totalAmount: foodSubtotal,
  };
}