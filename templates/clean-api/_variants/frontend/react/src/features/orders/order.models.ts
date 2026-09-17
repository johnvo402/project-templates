export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
export type MutableOrderStatus = 'Processing' | 'Completed';

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type OrderItemModel = { productId: string; quantity: number };
export type CreateOrderModel = { customerName: string; customerPhone: string | null; items: OrderItemModel[] };

export type ProductOption = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
};

export type OrderFilterState = {
  keyword: string;
  sort: string;
  status: string;
  minTotal: string;
};
