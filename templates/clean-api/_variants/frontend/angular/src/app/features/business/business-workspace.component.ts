import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { ProfilePage } from '../profile/profile.page';
import {
  BusinessApiService,
  CreateEmployeeModel,
  Dashboard,
  Employee,
  Order,
  OrderItemModel,
  OrderStatusReport,
  Product,
  ProductModel,
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
      @if(actionError){<div class="panel compact-notice error-panel">{{actionError}}</div>}
      @if(notice){<div class="panel compact-notice success-panel">{{notice}}</div>}

      @switch(section){
        @case('dashboard'){
          <header class="page-heading"><div><p class="eyebrow">Overview</p><h1>Dashboard</h1><p>Live operational snapshot. Data refreshes directly every 30 seconds.</p></div><div class="page-actions"><button class="ghost" (click)="refresh()">Refresh</button></div></header>
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
          <header class="page-heading"><div><p class="eyebrow">Sales</p><h1>Products</h1><p>Catalog, pricing and stock at a glance.</p></div><div class="page-actions"><button class="ghost" (click)="refresh()">Refresh</button>@if(auth.can('products.create')){<button class="primary" (click)="openProductCreate()">Add product</button>}</div></header>
          @if(showProductForm){<article class="panel editor-panel">
            <div class="panel-title"><h2>{{editingProduct?'Edit product':'New product'}}</h2><button class="link-button" (click)="showProductForm=false">Close</button></div>
            <div class="form-grid">
              <label>Name<input [(ngModel)]="productDraft.name"/></label>
              <label>SKU<input [(ngModel)]="productDraft.sku" (ngModelChange)="productDraft.sku=$event.toUpperCase()"/></label>
              <label>Price<input type="number" min="0" step="0.01" [(ngModel)]="productDraft.price"/></label>
              <label>Stock quantity<input type="number" min="0" [(ngModel)]="productDraft.stockQuantity"/></label>
              <label class="check-field"><input type="checkbox" [(ngModel)]="productDraft.isActive"/> Active</label>
            </div>
            <div class="form-actions"><button class="primary" [disabled]="savingAction||!productDraft.name.trim()||!productDraft.sku.trim()" (click)="saveProduct()">{{savingAction?'Saving…':editingProduct?'Save changes':'Create product'}}</button></div>
          </article>}
          @if(products){<div class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>
            @for(product of products;track product.id){<tr><td>{{product.name}}</td><td>{{product.sku}}</td><td>{{money(product.price)}}</td><td>{{product.stockQuantity}}</td><td><span [class]="product.isActive?'status status-active':'status status-inactive'">{{product.isActive?'Active':'Inactive'}}</span></td><td>{{date(product.updatedAt)}}</td><td><div class="row-actions">@if(auth.can('products.update')){<button (click)="openProductEdit(product)">Edit</button>}@if(auth.can('products.delete')){<button class="danger-link" (click)="deleteProduct(product)">Delete</button>}</div></td></tr>}@empty{<tr><td colspan="7" class="empty-cell">No products yet.</td></tr>}
          </tbody></table></div></div>}
        }
        @case('orders'){
          <header class="page-heading"><div><p class="eyebrow">Sales</p><h1>Orders</h1><p>Create orders and move them through fulfillment.</p></div><div class="page-actions"><button class="ghost" (click)="refresh()">Refresh</button>@if(auth.can('orders.create')){<button class="primary" (click)="openOrderCreate()">New order</button>}</div></header>
          @if(showOrderForm){<article class="panel editor-panel">
            <div class="panel-title"><h2>New order</h2><button class="link-button" (click)="showOrderForm=false">Close</button></div>
            <div class="form-grid"><label>Customer name<input [(ngModel)]="orderCustomerName"/></label><label>Phone<input [(ngModel)]="orderCustomerPhone"/></label></div>
            <div class="order-items"><div class="subheading"><strong>Items</strong><button class="ghost small" (click)="addOrderItem()">Add item</button></div>
              @for(item of orderItems;track $index;let i=$index){<div class="item-row"><select [(ngModel)]="item.productId"><option value="">Select product</option>@for(product of availableProducts;track product.id){<option [value]="product.id">{{product.name}} · {{money(product.price)}} · {{product.stockQuantity}} in stock</option>}</select><input type="number" min="1" [(ngModel)]="item.quantity"/><button class="link-button danger-link" (click)="removeOrderItem(i)">Remove</button></div>}
            </div><div class="form-actions"><button class="primary" [disabled]="savingAction||!orderCustomerName.trim()||!hasOrderItem()" (click)="createOrder()">{{savingAction?'Creating…':'Create order'}}</button></div>
          </article>}
          @if(orders){<div class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Items</th><th>Total</th><th>Created</th><th>Actions</th></tr></thead><tbody>
            @for(order of orders;track order.id){<tr><td>{{order.orderNumber}}</td><td>{{order.customerName}}</td><td><span [class]="statusClass(order.status)">{{order.status}}</span></td><td>{{order.itemCount}}</td><td>{{money(order.totalAmount)}}</td><td>{{date(order.createdAt)}}</td><td><div class="row-actions">@if(auth.can('orders.update-status')&&order.status==='Pending'){<button (click)="updateOrderStatus(order,'Processing')">Process</button>}@if(auth.can('orders.update-status')&&(order.status==='Pending'||order.status==='Processing')){<button (click)="updateOrderStatus(order,'Completed')">Complete</button>}@if(auth.can('orders.cancel')&&order.status!=='Completed'&&order.status!=='Cancelled'){<button class="danger-link" (click)="cancelOrder(order)">Cancel</button>}</div></td></tr>}@empty{<tr><td colspan="7" class="empty-cell">No orders yet.</td></tr>}
          </tbody></table></div></div>}
        }
        @case('employees'){
          <header class="page-heading"><div><p class="eyebrow">Management</p><h1>Employees</h1><p>Team access, roles and account status.</p></div><div class="page-actions"><button class="ghost" (click)="refresh()">Refresh</button>@if(auth.can('employees.create')){<button class="primary" (click)="openEmployeeCreate()">Add employee</button>}</div></header>
          @if(showEmployeeForm){<article class="panel editor-panel"><div class="panel-title"><h2>New employee</h2><button class="link-button" (click)="showEmployeeForm=false">Close</button></div><div class="form-grid">
            <label>Display name<input [(ngModel)]="employeeDraft.displayName"/></label><label>Email<input type="email" [(ngModel)]="employeeDraft.email"/></label><label>Temporary password<input type="password" [(ngModel)]="employeeDraft.password"/></label><label>Role<select [(ngModel)]="employeeDraft.role">@for(role of roles;track role){<option [value]="role">{{role}}</option>}</select></label>
          </div><div class="form-actions"><button class="primary" [disabled]="savingAction||!employeeDraft.displayName.trim()||!employeeDraft.email.trim()||!employeeDraft.password" (click)="createEmployee()">{{savingAction?'Creating…':'Create employee'}}</button></div></article>}
          @if(employees){<div class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
            @for(employee of employees;track employee.id){<tr><td><span class="person-cell">@if(employee.avatarUrl){<img [src]="employee.avatarUrl" alt=""/>}@else{<i>{{employee.displayName.slice(0,1).toUpperCase()}}</i>}<strong>{{employee.displayName}}</strong></span></td><td>{{employee.email}}</td><td>@if(auth.can('employees.change-role')){<select class="table-select" [ngModel]="employee.role" (ngModelChange)="changeEmployeeRole(employee,$event)">@for(role of roles;track role){<option [value]="role">{{role}}</option>}</select>}@else{{{employee.role}}}</td><td><span [class]="employee.isActive?'status status-active':'status status-inactive'">{{employee.isActive?'Active':'Disabled'}}</span></td><td>{{date(employee.createdAt)}}</td><td><div class="row-actions">@if(auth.can('employees.update')){<button [class.danger-link]="employee.isActive" (click)="toggleEmployeeStatus(employee)">{{employee.isActive?'Disable':'Enable'}}</button>}</div></td></tr>}@empty{<tr><td colspan="6" class="empty-cell">No employees yet.</td></tr>}
          </tbody></table></div></div>}
        }
        @case('reports'){
          <header class="page-heading"><div><p class="eyebrow">Analytics</p><h1>Reports</h1><p>Fresh calculations read directly from operational data.</p></div><div class="page-actions"><button class="ghost" (click)="refresh()">Refresh</button></div></header>
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
          </div>@if(auth.can('settings.update')){<div class="form-actions"><button class="primary" (click)="saveSettings()" [disabled]="savingAction">{{savingAction?'Saving…':'Save settings'}}</button></div>}</article>}
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
  readonly roles=['Admin','Manager','Staff'];
  section:Section='dashboard'; loading=false; error=''; savingAction=false; notice=''; actionError='';
  dashboard?:Dashboard; products?:Product[]; orders?:Order[]; employees?:Employee[]; topProducts:TopProduct[]=[]; orderStatuses:OrderStatusReport[]=[]; settings?:StoreSettings;
  showProductForm=false; editingProduct?:Product; productDraft:ProductModel=this.emptyProduct();
  showOrderForm=false; orderCustomerName=''; orderCustomerPhone=''; orderItems:OrderItemModel[]=[{productId:'',quantity:1}]; availableProducts:Product[]=[];
  showEmployeeForm=false; employeeDraft:CreateEmployeeModel=this.emptyEmployee();

  ngOnInit(){void this.load('dashboard');this.timer=setInterval(()=>{if(this.section==='dashboard')void this.load('dashboard',true);},30000);}
  ngOnDestroy(){if(this.timer)clearInterval(this.timer);}
  open(section:Section){this.section=section;this.clearActionState();void this.load(section);}
  refresh(){void this.load(this.section);}
  async load(section:Section,silent=false){if(section==='profile')return;if(!silent)this.loading=true;this.error='';try{switch(section){
    case'dashboard':this.dashboard=await firstValueFrom(this.api.getDashboard());break;
    case'products':this.products=(await firstValueFrom(this.api.getProducts())).data;break;
    case'orders':this.orders=(await firstValueFrom(this.api.getOrders())).data;break;
    case'employees':this.employees=(await firstValueFrom(this.api.getEmployees())).data;break;
    case'reports':[this.topProducts,this.orderStatuses]=await Promise.all([firstValueFrom(this.api.getTopProducts()),firstValueFrom(this.api.getOrderStatuses())]);break;
    case'settings':this.settings={...await firstValueFrom(this.api.getSettings())};break;
  }}catch(error){this.error=this.message(error);}finally{if(!silent)this.loading=false;}}

  openProductCreate(){this.editingProduct=undefined;this.productDraft=this.emptyProduct();this.showProductForm=true;this.clearActionState();}
  openProductEdit(product:Product){this.editingProduct=product;this.productDraft={name:product.name,sku:product.sku,price:product.price,stockQuantity:product.stockQuantity,isActive:product.isActive};this.showProductForm=true;this.clearActionState();}
  async saveProduct(){if(!this.productDraft.name.trim()||!this.productDraft.sku.trim())return;await this.action(async()=>{if(this.editingProduct)await firstValueFrom(this.api.updateProduct(this.editingProduct.id,this.productDraft));else await firstValueFrom(this.api.createProduct(this.productDraft));this.notice=this.editingProduct?'Product updated.':'Product created.';this.showProductForm=false;this.editingProduct=undefined;this.productDraft=this.emptyProduct();await this.load('products',true);});}
  async deleteProduct(product:Product){if(!confirm(`Delete ${product.name}?`))return;await this.action(async()=>{await firstValueFrom(this.api.deleteProduct(product.id));this.notice='Product deleted.';await this.load('products',true);});}

  async openOrderCreate(){this.showOrderForm=true;this.orderCustomerName='';this.orderCustomerPhone='';this.orderItems=[{productId:'',quantity:1}];this.clearActionState();try{this.availableProducts=(await firstValueFrom(this.api.getProducts(true))).data;}catch(error){this.actionError=this.message(error);}}
  addOrderItem(){this.orderItems=[...this.orderItems,{productId:'',quantity:1}];}
  removeOrderItem(index:number){if(this.orderItems.length>1)this.orderItems=this.orderItems.filter((_,i)=>i!==index);}
  hasOrderItem(){return this.orderItems.some(item=>!!item.productId&&item.quantity>0);}
  async createOrder(){if(!this.orderCustomerName.trim()||!this.hasOrderItem())return;await this.action(async()=>{await firstValueFrom(this.api.createOrder({customerName:this.orderCustomerName,customerPhone:this.orderCustomerPhone.trim()||null,items:this.orderItems.filter(item=>item.productId).map(item=>({...item,quantity:Math.max(1,item.quantity)}))}));this.notice='Order created.';this.showOrderForm=false;await this.load('orders',true);});}
  async updateOrderStatus(order:Order,status:'Processing'|'Completed'){await this.action(async()=>{await firstValueFrom(this.api.updateOrderStatus(order.id,status));this.notice=`Order moved to ${status}.`;await this.load('orders',true);});}
  async cancelOrder(order:Order){if(!confirm(`Cancel ${order.orderNumber}? Stock will be restored.`))return;await this.action(async()=>{await firstValueFrom(this.api.cancelOrder(order.id));this.notice='Order cancelled.';await this.load('orders',true);});}

  openEmployeeCreate(){this.employeeDraft=this.emptyEmployee();this.showEmployeeForm=true;this.clearActionState();}
  async createEmployee(){if(!this.employeeDraft.displayName.trim()||!this.employeeDraft.email.trim()||!this.employeeDraft.password)return;await this.action(async()=>{await firstValueFrom(this.api.createEmployee(this.employeeDraft));this.notice='Employee created.';this.showEmployeeForm=false;this.employeeDraft=this.emptyEmployee();await this.load('employees',true);});}
  async changeEmployeeRole(employee:Employee,role:string){if(role===employee.role)return;await this.action(async()=>{await firstValueFrom(this.api.changeEmployeeRole(employee.id,role));this.notice=`${employee.displayName}'s role updated.`;await this.load('employees',true);});}
  async toggleEmployeeStatus(employee:Employee){const next=!employee.isActive;await this.action(async()=>{await firstValueFrom(this.api.setEmployeeStatus(employee.id,next));this.notice=`${employee.displayName} ${next?'enabled':'disabled'}.`;await this.load('employees',true);});}

  async saveSettings(){if(!this.settings||!this.auth.can('settings.update'))return;await this.action(async()=>{this.settings=await firstValueFrom(this.api.updateSettings(this.settings!));this.notice='Settings saved.';});}
  money(value:number){const currency=this.settings?.currency||'USD';try{return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(value??0);}catch{return `${value??0} ${currency}`;}}
  date(value:string){return new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(value));}
  statusClass(status:string){return `status status-${status.toLowerCase()}`;}
  private emptyProduct():ProductModel{return{name:'',sku:'',price:0,stockQuantity:0,isActive:true};}
  private emptyEmployee():CreateEmployeeModel{return{email:'',password:'',displayName:'',role:'Staff'};}
  private clearActionState(){this.notice='';this.actionError='';}
  private async action(work:()=>Promise<void>){this.savingAction=true;this.clearActionState();try{await work();}catch(error){this.actionError=this.message(error);}finally{this.savingAction=false;}}
  private message(error:unknown){if(error&&typeof error==='object'){const record=error as Record<string,unknown>;for(const key of ['detail','title','message'])if(typeof record[key]==='string')return record[key] as string;const errors=record['errors'];if(errors&&typeof errors==='object'){const first=Object.values(errors as Record<string,unknown>)[0];if(Array.isArray(first)&&typeof first[0]==='string')return first[0];}}return'The request could not be completed.';}
}
