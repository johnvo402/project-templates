export type DashboardRevenuePoint = {
  date: string;
  revenue: number;
};

export type DashboardTopProduct = {
  productName: string;
  revenue: number;
};

export type DashboardProjection = {
  revenueToday: number;
  revenueThisMonth: number;
  revenue: DashboardRevenuePoint[];
  topProducts: DashboardTopProduct[];
};
