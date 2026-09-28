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

const BASE_DELIVERY_FEE = 10.00; // Base rate in GHS
const PER_KM_RATE = 3.50;        // Per km rate in GHS

export function calculateOrderPricing(params: DeliveryParams): PricingBreakdown {
  const { fulfillment, distanceKm = 0, foodSubtotal } = params;

  if (foodSubtotal < 0) {
    throw new Error('Food subtotal cannot be negative.');
  }

  if (fulfillment === 'PICKUP') {
    return {
      foodSubtotal,
      deliveryFee: 0.00,
      totalAmount: foodSubtotal,
    };
  }

  if (distanceKm <= 0) {
    throw new Error('A valid positive distance is required for delivery fee computation.');
  }

  const calculatedFee = BASE_DELIVERY_FEE + (distanceKm * PER_KM_RATE);
  const deliveryFee = Math.round(calculatedFee * 100) / 100;
  const totalAmount = Math.round((foodSubtotal + deliveryFee) * 100) / 100;

  return {
    foodSubtotal,
    deliveryFee,
    totalAmount,
  };
}
