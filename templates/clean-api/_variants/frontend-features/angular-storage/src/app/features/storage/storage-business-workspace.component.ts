import { Component, inject } from '@angular/core';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { BusinessWorkspaceComponent } from '../business/business-workspace.component';
import { ProductImagesWorkspaceComponent } from '../products/product-images-workspace.component';

@Component({
  selector:'app-storage-business-workspace',
  standalone:true,
  imports:[BusinessWorkspaceComponent,ProductImagesWorkspaceComponent],
  styles:[`.storage-workspace-tabs{display:flex;gap:8px;align-items:center;margin:0 0 18px;padding:7px;width:max-content;border:1px solid #e5e7eb;background:#fff;border-radius:16px}.storage-workspace-tabs button{border:0;background:transparent;border-radius:9px;padding:9px 14px;font-weight:750;color:#64748b;cursor:pointer}.storage-workspace-tabs button.active{background:#111827;color:#fff}@media(max-width:620px){.storage-workspace-tabs{width:100%}.storage-workspace-tabs button{flex:1}}`],
  template:`
    @if(auth.can('products.view')){<div class="storage-workspace-tabs" role="tablist" aria-label="Workspace mode"><button type="button" [class.active]="section==='operations'" (click)="section='operations'">Operations</button><button type="button" [class.active]="section==='images'" (click)="section='images'">Product Images</button></div>}
    @if(section==='images'&&auth.can('products.view')){<app-product-images-workspace/>}@else{<app-business-workspace/>}
  `
})
export class StorageBusinessWorkspaceComponent { readonly auth=inject(AuthSessionService);section:'operations'|'images'='operations'; }
