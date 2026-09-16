import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { ProfilePage } from '../profile/profile.page';
import {
  BusinessApiService,
  Dashboard,
  Employee,
  Order,
  OrderStatusReport,
  Product,
  StoreSettings,
  TopProduct,
} from './business-api.service';

type Section='dashboard'|'orders'|'products'|'employees'|'reports'|'settings'|'profile';

@Component({
  selector:'app-business-workspace',
  standalone:true,
  imports:[CommonModule,FormsModule,ProfilePage],
  styleUrl:'./business.css',
  template:`
  <div class="business-layout">
    <aside class="business-sidebar">
      <div class="sidebar-heading"><span class="sidebar-kicker">Mini Store</span><strong>Operations</strong></div>
      <nav>
        @if(auth.can('dashboard.view')){<div class="nav-group"><span>Overview</span><button [class.active]="section==='dashboard'" (click)="open('dashboard')">Dashboard</button></div>}
        <div class="nav-group"><span>Sales</span>
          @if(auth.can('orders.view')){<button [class.active]="section==='orders'" (click)="open('orders')">Orders</button>}
          @if(auth.can('products.view')){<button [class.active]="section==='products'" (click)="open('products')">Products</button>}
        </div>
        @if(auth.can('employees.view')){<div class="nav-group"><span>Management</span><button [class.active]="section==='employees'" (click)="open('employees')">Employees</button></div>}
        @if(auth.can('reports.view')){<div class="nav-group"><span>Analytics</span><button [class.active]="section==='reports'" (click)="open('reports')">Reports</button></div>}
        @if(auth.can('settings.view')){<div class="nav-group"><span>System</span><button [class.active]="section==='settings'" (click)="open('settings')">Settings</button></div>}
        <div class="nav-group"><span>Account</span><button [class.active]="section==='profile'" (click)="open('profile')">Profile</button></div>
      </nav>
    </aside>

    <section class="business-content">
      @if(error){<div class="panel error-panel">{{error}}</div>}
      @if(loading){<div class="panel muted-panel">Loading data…</div>}

      @switch(section){
        @case('dashboard'){
          <header class="page-heading"><div><p class="eyebrow">Overview</p><h1>Dashboard</h1><p>Live operational snapshot. Data refreshes directly every 30 seconds.</p></div><button class="ghost" (click)="refresh()">Refresh</button></header>
          @if(dashboard){
            <div class="metric-grid">
              <article class="metric-card"><span>Revenue today</span><strong>{{money(dashboard.revenueToday)}}</strong></article>
              <article class="metric-card"><span>Revenue this month</span><strong>{{money(dashboard.revenueThisMonth)}}</strong></article>
              <article class="metric-card"><span>Orders</span><strong>{{dashboard.totalOrders}}</strong></article>
              <article class="metric-card"><span>Pending orders</span><strong>{{dashboard.pendingOrders}}</strong></article>
              <article class="metric-card"><span>Products</span><strong>{{dashboard.totalProducts}}</strong></article>
              <article class="metric-card"><span>Low stock</span><strong>{{dashboard.lowStockProducts}}</strong></article>
              <article class="metric-card"><span>Employees</span><strong>{{dashboard.totalEmployees}}</strong></article>
            </div>
            <div class="content-grid two-columns">
              <article class="panel"><div class="panel-title"><h2>Top products</h2><span>By revenue</span></div><div class="stack-list">
                @for(item of dashboard.topProducts.slice(0,6);track item.productName;let i=$index){<div class="rank-row"><b>{{i+1}}</b><div><strong>{{item.productName}}</strong><span>{{item.quantity}} sold</span></div><em>{{money(item.revenue)}}</em></div>}
              </div></article>
              <article class="panel"><div class="panel-title"><h2>Recent orders</h2><span>Latest activity</span></div><div class="stack-list">
                @for(order of dashboard.recentOrders.slice(0,6);track order.id){<div class="order-row"><div><strong>{{order.orderNumber}}</strong><span>{{order.customerName}}</span></div><span [class]="statusClass(order.status)">{{order.status}}</span><em>{{money(order.totalAmount)}}</em></div>}
              </div></article>
            </div>
          }
        }
        @case('products'){
          <header class="page-heading"><div><p class="eyebrow">Sales</p><h1>Products</h1><p>Catalog, pricing and stock at a glance.</p></div><button class="ghost" (click)="refresh()">Refresh</button></header>
          @if(products){<div class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Updated</th></tr></thead><tbody>
            @for(product of products;track product.id){<tr><td>{{product.name}}</td><td>{{product.sku}}</td><td>{{money(product.price)}}</td><td>{{product.stockQuantity}}</td><td><span [class]="product.isActive?'status status-active':'status status-inactive'">{{product.isActive?'Active':'Inactive'}}</span></td><td>{{date(product.updatedAt)}}</td></tr>}@empty{<tr><td colspan="6" class="empty-cell">No products yet.</td></tr>}
          </tbody></table></div></div>}
        }
        @case('orders'){
          <header class="page-heading"><div><p class="eyebrow">Sales</p><h1>Orders</h1><p>Track fulfillment status and order value.</p></div><button class="ghost" (click)="refresh()">Refresh</button></header>
          @if(orders){<div class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Items</th><th>Total</th><th>Created</th></tr></thead><tbody>
            @for(order of orders;track order.id){<tr><td>{{order.orderNumber}}</td><td>{{order.customerName}}</td><td><span [class]="statusClass(order.status)">{{order.status}}</span></td><td>{{order.itemCount}}</td><td>{{money(order.totalAmount)}}</td><td>{{date(order.createdAt)}}</td></tr>}@empty{<tr><td colspan="6" class="empty-cell">No orders yet.</td></tr>}
          </tbody></table></div></div>}
        }
        @case('employees'){
          <header class="page-heading"><div><p class="eyebrow">Management</p><h1>Employees</h1><p>Team access, roles and account status.</p></div><button class="ghost" (click)="refresh()">Refresh</button></header>
          @if(employees){<div class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead><tbody>
            @for(employee of employees;track employee.id){<tr><td><span class="person-cell">@if(employee.avatarUrl){<img [src]="employee.avatarUrl" alt=""/>}@else{<i>{{employee.displayName.slice(0,1).toUpperCase()}}</i>}<strong>{{employee.displayName}}</strong></span></td><td>{{employee.email}}</td><td>{{employee.role}}</td><td><span [class]="employee.isActive?'status status-active':'status status-inactive'">{{employee.isActive?'Active':'Disabled'}}</span></td><td>{{date(employee.createdAt)}}</td></tr>}@empty{<tr><td colspan="5" class="empty-cell">No employees yet.</td></tr>}
          </tbody></table></div></div>}
        }
        @case('reports'){
          <header class="page-heading"><div><p class="eyebrow">Analytics</p><h1>Reports</h1><p>Fresh calculations read directly from operational data.</p></div><button class="ghost" (click)="refresh()">Refresh</button></header>
          <div class="content-grid two-columns">
            <article class="panel"><div class="panel-title"><h2>Top products</h2></div>@for(item of topProducts;track item.productName){<div class="report-line"><span>{{item.productName}}</span><strong>{{item.quantity}}</strong><em>{{money(item.revenue)}}</em></div>}</article>
            <article class="panel"><div class="panel-title"><h2>Orders by status</h2></div>@for(item of orderStatuses;track item.status){<div class="report-line"><span>{{item.status}}</span><strong>{{item.count}}</strong></div>}</article>
          </div>
        }
        @case('settings'){
          <header class="page-heading"><div><p class="eyebrow">System</p><h1>Settings</h1><p>Store identity and operational defaults.</p></div></header>
          @if(settings){<article class="panel settings-form"><div class="form-grid">
            <label>Store name<input [(ngModel)]="settings.storeName" [disabled]="!auth.can('settings.update')"/></label>
            <label>Email<input [(ngModel)]="settings.storeEmail" [disabled]="!auth.can('settings.update')"/></label>
            <label>Phone<input [(ngModel)]="settings.storePhone" [disabled]="!auth.can('settings.update')"/></label>
            <label>Currency<input [(ngModel)]="settings.currency" [disabled]="!auth.can('settings.update')"/></label>
            <label>Timezone<input [(ngModel)]="settings.timezone" [disabled]="!auth.can('settings.update')"/></label>
            <label>Low-stock threshold<input type="number" min="0" [(ngModel)]="settings.lowStockThreshold" [disabled]="!auth.can('settings.update')"/></label>
          </div>@if(auth.can('settings.update')){<div class="form-actions"><button class="primary" (click)="saveSettings()" [disabled]="saving">{{saving?'Saving…':'Save settings'}}</button><span>{{notice}}</span></div>}</article>}
        }
        @case('profile'){
          <header class="page-heading"><div><p class="eyebrow">Account</p><h1>Profile</h1><p>Manage your personal account information.</p></div></header>
          <app-profile-page/>
        }
      }
    </section>
  </div>`
})
export class BusinessWorkspaceComponent implements OnInit,OnDestroy {
  readonly auth=inject(AuthSessionService); private readonly api=inject(BusinessApiService); private timer?:ReturnType<typeof setInterval>;
  section:Section='dashboard'; loading=false; error=''; saving=false; notice='';
  dashboard?:Dashboard; products?:Product[]; orders?:Order[]; employees?:Employee[]; topProducts:TopProduct[]=[]; orderStatuses:OrderStatusReport[]=[]; settings?:StoreSettings;
  ngOnInit(){void this.load('dashboard');this.timer=setInterval(()=>{if(this.section==='dashboard')void this.load('dashboard',true);},30000);}
  ngOnDestroy(){if(this.timer)clearInterval(this.timer);}
  open(section:Section){this.section=section;void this.load(section);}
  refresh(){void this.load(this.section);}
  async load(section:Section,silent=false){if(section==='profile')return; if(!silent)this.loading=true;this.error='';try{switch(section){
    case'dashboard':this.dashboard=await firstValueFrom(this.api.getDashboard());break;
    case'products':this.products=(await firstValueFrom(this.api.getProducts())).data;break;
    case'orders':this.orders=(await firstValueFrom(this.api.getOrders())).data;break;
    case'employees':this.employees=(await firstValueFrom(this.api.getEmployees())).data;break;
    case'reports':[this.topProducts,this.orderStatuses]=await Promise.all([firstValueFrom(this.api.getTopProducts()),firstValueFrom(this.api.getOrderStatuses())]);break;
    case'settings':this.settings={...await firstValueFrom(this.api.getSettings())};break;
  }}catch(error){this.error=this.message(error);}finally{if(!silent)this.loading=false;}}
  async saveSettings(){if(!this.settings||!this.auth.can('settings.update'))return;this.saving=true;this.notice='';try{this.settings=await firstValueFrom(this.api.updateSettings(this.settings));this.notice='Settings saved.';}catch(error){this.notice=this.message(error);}finally{this.saving=false;}}
  money(value:number){const currency=this.settings?.currency||'USD';try{return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(value??0);}catch{return `${value??0} ${currency}`;}}
  date(value:string){return new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(value));}
  statusClass(status:string){return `status status-${status.toLowerCase()}`;}
  private message(error:unknown){if(error&&typeof error==='object'){const record=error as Record<string,unknown>;for(const key of ['detail','title','message'])if(typeof record[key]==='string')return record[key] as string;}return'Unable to load data.';}
}
