export type DashboardTopProduct = { productName: string; quantity: number; revenue: number };
export type DashboardRecentOrder = { id: string; orderNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string };
export type DashboardProjection = {
  revenueToday: number;
  revenueThisMonth: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalEmployees: number;
  topProducts: DashboardTopProduct[];
  recentOrders: DashboardRecentOrder[];
};
