import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse, PaginationResponse } from '../../core/api/api.models';

export type Dashboard = {
  revenueToday:number; revenueThisMonth:number; totalOrders:number; pendingOrders:number;
  totalProducts:number; lowStockProducts:number; totalEmployees:number;
  topProducts:TopProduct[]; recentOrders:RecentOrder[];
};
export type TopProduct = { productName:string; quantity:number; revenue:number };
export type RecentOrder = { id:string; orderNumber:string; customerName:string; status:string; totalAmount:number; createdAt:string };
export type Product = { id:string; name:string; sku:string; price:number; stockQuantity:number; isActive:boolean; updatedAt:string };
export type Order = { id:string; orderNumber:string; customerName:string; status:string; totalAmount:number; itemCount:number; createdAt:string };
export type Employee = { id:string; email:string; displayName:string; role:string; isActive:boolean; avatarUrl?:string|null; createdAt:string };
export type OrderStatusReport = { status:string; count:number };
export type StoreSettings = { storeName:string; storeEmail:string; storePhone:string; currency:string; timezone:string; lowStockThreshold:number };

@Injectable({ providedIn:'root' })
export class BusinessApiService {
  private readonly http=inject(HttpClient);
  getDashboard(){return this.get<Dashboard>('/api/dashboard');}
  getProducts(){return this.get<PaginationResponse<Product>>('/api/products?page=1&pageSize=20');}
  getOrders(){return this.get<PaginationResponse<Order>>('/api/orders?page=1&pageSize=20');}
  getEmployees(){return this.get<PaginationResponse<Employee>>('/api/employees?page=1&pageSize=20');}
  getTopProducts(){return this.get<TopProduct[]>('/api/reports/top-products?take=10');}
  getOrderStatuses(){return this.get<OrderStatusReport[]>('/api/reports/orders-by-status');}
  getSettings(){return this.get<StoreSettings>('/api/settings');}
  updateSettings(model:StoreSettings){return this.http.put<ApiResponse<StoreSettings>>('/api/settings',model).pipe(map(response=>response.results));}
  private get<T>(url:string):Observable<T>{return this.http.get<ApiResponse<T>>(url).pipe(map(response=>response.results));}
}
