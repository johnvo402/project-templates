import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PaginationResponse } from '../../core/api/api.models';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { BusinessApiService, Product } from '../business/business-api.service';
import { BusinessPaginationComponent } from '../business/business-pagination.component';
import { FILTER_ENABLED, type BusinessListQuery } from '../../shared/query/business-query';
import { ProductImage, ProductImagesApiService } from './product-images-api.service';

@Component({
  selector:'app-product-images-workspace',
  standalone:true,
  imports:[CommonModule,FormsModule,BusinessPaginationComponent],
  styleUrl:'./product-images.css',
  template:`
  <div class="product-media-page">
    <header class="media-page-heading"><div><p class="eyebrow">Object storage</p><h1>Product Images</h1><p>Manage up to eight JPEG, PNG or WebP images per product. Primary images are used as the preferred storefront asset.</p></div><button class="ghost" type="button" [disabled]="!selected||imagesLoading" (click)="refreshImages()">Refresh images</button></header>
    @if(error||notice){<div [class]="'panel compact-notice '+(error?'error-panel':'success-panel')">{{error||notice}}</div>}
    <div class="media-workspace-grid">
      <aside class="panel media-products-panel">
        <div class="panel-title"><h2>Products</h2><span>{{productPage?.data?.length||0}} on page</span></div>
        @if(filterEnabled){<form class="media-search" (submit)="applySearch($event)"><input [(ngModel)]="keyword" name="keyword" placeholder="Search name or SKU"/><button class="primary" type="submit">Search</button><button class="ghost" type="button" (click)="clearSearch()">Clear</button></form>}
        @if(productsLoading){<p class="media-muted">Loading products…</p>}@else{<div class="media-product-list">@for(product of productPage?.data||[];track product.id){<button type="button" [class]="'media-product-item '+(selected?.id===product.id?'active':'')" (click)="selectProduct(product)"><span><strong>{{product.name}}</strong><small>{{product.sku}}</small></span><i [class]="product.isActive?'active-dot':'inactive-dot'"></i></button>}@empty{<p class="media-muted">No products found.</p>}</div>}
        @if(productPage?.paging){<app-business-pagination [paging]="productPage!.paging!" [pageSize]="query.pageSize" (pageChange)="changePage($event)" (pageSizeChange)="changePageSize($event)"/>}
      </aside>
      <section class="panel media-gallery-panel">
        @if(!selected){<div class="media-empty"><strong>Select a product</strong><span>Choose a product to manage its images.</span></div>}@else{
          <div class="media-gallery-heading"><div><p class="eyebrow">{{selected.sku}}</p><h2>{{selected.name}}</h2><span>{{images.length}} / 8 images</span></div>@if(canUpdate){<label [class]="'primary upload-button '+(busy||images.length>=8?'disabled':'')">Upload images<input type="file" multiple accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" [disabled]="busy||images.length>=8" (change)="filesSelected($event)"/></label>}</div>
          @if(!canUpdate){<div class="media-readonly">You can view product images. Updating images requires the <code>products.update</code> permission.</div>}
          @if(imagesLoading){<p class="media-muted">Loading images…</p>}@else if(images.length===0){<div class="media-empty"><strong>No images yet</strong><span>{{canUpdate?'Upload the first image; it will become primary automatically.':'This product does not have any stored images.'}}</span></div>}@else{<div class="product-image-grid">@for(image of images;track image.id){<article [class]="'product-image-card '+(image.isPrimary?'primary-image':'')"><div class="product-image-preview"><img [src]="image.url" [alt]="selected.name+' product'" loading="lazy"/>@if(image.isPrimary){<span>Primary</span>}</div><div class="product-image-meta"><small>{{date(image.createdAt)}}</small>@if(canUpdate){<div><button type="button" class="link-button" [disabled]="busy||image.isPrimary" (click)="makePrimary(image)">{{image.isPrimary?'Primary':'Set primary'}}</button><button type="button" class="link-button danger-link" [disabled]="busy" (click)="deleteImage(image)">Delete</button></div>}</div></article>}</div>}
        }
      </section>
    </div>
  </div>`
})
export class ProductImagesWorkspaceComponent implements OnInit {
  private readonly businessApi=inject(BusinessApiService);private readonly imagesApi=inject(ProductImagesApiService);readonly auth=inject(AuthSessionService);
  readonly filterEnabled=FILTER_ENABLED;readonly maxImages=8;readonly maxBytes=5*1024*1024;readonly allowedTypes=new Set(['image/jpeg','image/png','image/webp']);
  query:BusinessListQuery={page:1,pageSize:10,sort:'Name:asc'};keyword='';productPage?:PaginationResponse<Product>;selected?:Product;images:ProductImage[]=[];
  productsLoading=true;imagesLoading=false;busy=false;error='';notice='';
  get canUpdate(){return this.auth.can('products.update');}
  ngOnInit(){void this.loadProducts();}
  async loadProducts(){this.productsLoading=true;this.error='';try{const page=await firstValueFrom(this.businessApi.getProducts(this.query));this.productPage=page;const next=this.selected&&page.data.some(product=>product.id===this.selected!.id)?this.selected:page.data[0];if(next?.id!==this.selected?.id){this.selected=next;if(next)await this.loadImages();else this.images=[];}else if(next)this.selected=next;}catch(error){this.error=this.message(error);}finally{this.productsLoading=false;}}
  selectProduct(product:Product){if(this.selected?.id===product.id)return;this.selected=product;void this.loadImages();}
  async loadImages(){if(!this.selected)return;this.imagesLoading=true;this.error='';try{this.images=await firstValueFrom(this.imagesApi.list(this.selected.id));}catch(error){this.images=[];this.error=this.message(error);}finally{this.imagesLoading=false;}}
  refreshImages(){void this.loadImages();}
  applySearch(event:Event){event.preventDefault();if(!this.filterEnabled)return;this.query={...this.query,page:1,keyword:this.keyword.trim()||undefined,targets:['Name','Sku'],sort:'Name:asc'};void this.loadProducts();}
  clearSearch(){this.keyword='';this.query={page:1,pageSize:this.query.pageSize,sort:'Name:asc'};void this.loadProducts();}
  changePage(page:number){this.query={...this.query,page};void this.loadProducts();}
  changePageSize(pageSize:number){this.query={...this.query,page:1,pageSize};void this.loadProducts();}
  async filesSelected(event:Event){const input=event.target as HTMLInputElement;const files=Array.from(input.files||[]);input.value='';if(!this.selected||!this.canUpdate||files.length===0)return;this.error='';this.notice='';if(this.images.length>=this.maxImages){this.error=`A product can have at most ${this.maxImages} images.`;return;}if(files.length>this.maxImages-this.images.length){this.error=`Only ${this.maxImages-this.images.length} image slot(s) remain for this product.`;return;}const invalid=files.find(file=>!this.allowedTypes.has(file.type)||file.size<=0||file.size>this.maxBytes);if(invalid){this.error=`${invalid.name}: use JPEG, PNG or WebP files up to 5 MB.`;return;}this.busy=true;try{for(const file of files)await firstValueFrom(this.imagesApi.upload(this.selected.id,file));this.notice=`${files.length} image${files.length===1?'':'s'} uploaded.`;await this.loadImages();}catch(error){this.error=this.message(error);await this.loadImages();}finally{this.busy=false;}}
  async makePrimary(image:ProductImage){if(!this.selected||!this.canUpdate||image.isPrimary)return;this.busy=true;this.error='';this.notice='';try{await firstValueFrom(this.imagesApi.setPrimary(this.selected.id,image.id));this.notice='Primary image updated.';await this.loadImages();}catch(error){this.error=this.message(error);}finally{this.busy=false;}}
  async deleteImage(image:ProductImage){if(!this.selected||!this.canUpdate||!confirm('Delete this product image?'))return;this.busy=true;this.error='';this.notice='';try{await firstValueFrom(this.imagesApi.deleteImage(this.selected.id,image.id));this.notice='Image deleted.';await this.loadImages();}catch(error){this.error=this.message(error);}finally{this.busy=false;}}
  date(value:string){return new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(value));}
  private message(error:unknown):string{if(error&&typeof error==='object'){const record=error as Record<string,unknown>;if(record['error']&&typeof record['error']==='object')return this.message(record['error']);for(const key of ['detail','title','message'])if(typeof record[key]==='string')return record[key] as string;const errors=record['errors'];if(errors&&typeof errors==='object'){const first=Object.values(errors as Record<string,unknown>)[0];if(Array.isArray(first)&&typeof first[0]==='string')return first[0];}}return'The request could not be completed.';}
}
