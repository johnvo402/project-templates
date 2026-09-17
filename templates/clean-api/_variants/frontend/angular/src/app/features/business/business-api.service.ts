import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse, PaginationResponse } from '../../core/api/api.models';
import { buildActiveProductsUrl, buildBusinessListUrl, type BusinessListQuery } from '../../shared/query/business-query';

export type Dashboard = {
  revenueToday:number; revenueThisMonth:number; totalOrders:number; pendingOrders:number;
  totalProducts:number; lowStockProducts:number; totalEmployees:number;
  topProducts:TopProduct[]; recentOrders:RecentOrder[];
};
export type TopProduct = { productName:string; quantity:number; revenue:number };
export type RecentOrder = { id:string; orderNumber:string; customerName:string; status:string; totalAmount:number; createdAt:string };
export type Product = { id:string; name:string; sku:string; price:number; stockQuantity:number; isActive:boolean; updatedAt:string };
export type ProductModel = { name:string; sku:string; price:number; stockQuantity:number; isActive:boolean };
export type OrderItem = { productId:string; productName:string; quantity:number; unitPrice:number; total:number };
export type Order = { id:string; orderNumber:string; customerName:string; status:string; totalAmount:number; items:OrderItem[]; createdAt:string };
export type OrderItemModel = { productId:string; quantity:number };
export type CreateOrderModel = { customerName:string; customerPhone:string|null; items:OrderItemModel[] };
export type Employee = { id:string; email:string; displayName:string; role:string; isActive:boolean; avatarUrl?:string|null; createdAt:string };
export type CreateEmployeeModel = { email:string; password:string; displayName:string; role:string };
export type OrderStatusReport = { status:string; count:number };
export type StoreSettings = { storeName:string; storeEmail:string; storePhone:string; currency:string; timezone:string; lowStockThreshold:number };

@Injectable({ providedIn:'root' })
export class BusinessApiService {
  private readonly http=inject(HttpClient);
  getDashboard(){return this.get<Dashboard>('/api/dashboard');}
  getProducts(query:BusinessListQuery){return this.get<PaginationResponse<Product>>(buildBusinessListUrl('products',query));}
  getActiveProducts(){return this.get<PaginationResponse<Product>>(buildActiveProductsUrl());}
  createProduct(model:ProductModel){return this.http.post('/api/products',model);}
  updateProduct(id:string,model:ProductModel){return this.http.put<void>(`/api/products/${id}`,model);}
  deleteProduct(id:string){return this.http.delete<void>(`/api/products/${id}`);}
  getOrders(query:BusinessListQuery){return this.get<PaginationResponse<Order>>(buildBusinessListUrl('orders',query));}
  createOrder(model:CreateOrderModel){return this.http.post('/api/orders',model);}
  updateOrderStatus(id:string,status:'Processing'|'Completed'){return this.http.put<void>(`/api/orders/${id}/status`,{status});}
  cancelOrder(id:string){return this.http.post<void>(`/api/orders/${id}/cancel`,{});}
  getEmployees(query:BusinessListQuery){return this.get<PaginationResponse<Employee>>(buildBusinessListUrl('employees',query));}
  createEmployee(model:CreateEmployeeModel){return this.http.post('/api/employees',model);}
  changeEmployeeRole(id:string,role:string){return this.http.put<void>(`/api/employees/${id}/role`,{role});}
  setEmployeeStatus(id:string,isActive:boolean){return this.http.put<void>(`/api/employees/${id}/status`,{isActive});}
  getTopProducts(){return this.get<TopProduct[]>('/api/reports/top-products?take=10');}
  getOrderStatuses(){return this.get<OrderStatusReport[]>('/api/reports/orders-by-status');}
  getSettings(){return this.get<StoreSettings>('/api/settings');}
  updateSettings(model:StoreSettings){return this.http.put<ApiResponse<StoreSettings>>('/api/settings',model).pipe(map(response=>response.results));}
  private get<T>(url:string):Observable<T>{return this.http.get<ApiResponse<T>>(url).pipe(map(response=>response.results));}
}
