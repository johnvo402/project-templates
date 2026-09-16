import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type Paging = {
  currentPage?:number|null;
  pageSize:number;
  totalPage:number;
  hasNextPage?:boolean|null;
  hasPreviousPage?:boolean|null;
};

@Component({
  selector:'app-business-pagination',
  standalone:true,
  imports:[CommonModule],
  styleUrl:'./business.css',
  template:`
    <div class="panel pagination-bar">
      <div class="pagination-summary"><strong>{{paging.totalPage?'Page '+current+' of '+paging.totalPage:'No results'}}</strong><span>{{pageSize}} rows per page</span></div>
      <div class="pagination-controls">
        <label>Rows<select [value]="pageSize" (change)="changePageSize($event)">@for(size of sizes;track size){<option [value]="size">{{size}}</option>}</select></label>
        <button type="button" class="ghost small" [disabled]="!paging.hasPreviousPage" (click)="pageChange.emit(Math.max(1,current-1))">Prev</button>
        <div class="page-numbers">@for(page of pages;track page){<button type="button" [class.active]="page===current" (click)="pageChange.emit(page)">{{page}}</button>}</div>
        <button type="button" class="ghost small" [disabled]="!paging.hasNextPage" (click)="pageChange.emit(current+1)">Next</button>
      </div>
    </div>`
})
export class BusinessPaginationComponent {
  @Input({required:true}) paging!:Paging;
  @Input({required:true}) pageSize=20;
  @Output() readonly pageChange=new EventEmitter<number>();
  @Output() readonly pageSizeChange=new EventEmitter<number>();
  readonly sizes=[10,20,50,100];
  readonly Math=Math;
  get current(){return this.paging.currentPage??1;}
  get pages(){const total=this.paging.totalPage;if(total<=0)return[];const start=Math.max(1,Math.min(this.current-2,total-4));const end=Math.min(total,start+4);return Array.from({length:end-start+1},(_,index)=>start+index);}
  changePageSize(event:Event){this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));}
}
