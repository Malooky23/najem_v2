import { z } from "zod";

export interface Order {
  orderId: string;
  orderNumber: number;
  customerName: string;
  orderDate: Date;
  status: string;
  total: number;
}

export const orderSchema = z.object({
  orderNumber: z.number(),
  customerName: z.string().min(1, "Customer Name is required"),
  orderDate: z.date(),
  status: z.string(),
  total: z.number().nonnegative(),
});

// Omit the orderId when creating a new order.
export interface CreateOrderInput extends Omit<Order, "orderId"> {} 