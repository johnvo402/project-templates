import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { buildPaginationItems, PaginationItem } from '../../shared/pagination';
import { TodoStore } from './todo.store';

@Component({
  selector: 'app-todo-page',
  standalone: true,
  imports: [FormsModule],
  styleUrls: ['../../shared/pagination.css'],
  template: `<section class="card span-2">
    <div class="section-heading"><div><p class="eyebrow">Productivity</p><h2>Todo list</h2></div><button class="ghost" (click)="store.load()">Refresh</button></div>
    @if(auth.can('todos.write')){<form class="inline-form" (ngSubmit)="create()"><input name="title" [(ngModel)]="title" placeholder="What needs to be done?"/><button class="primary">Add task</button></form>}
    @if(store.loading()){<p class="muted">Loading tasks…</p>}
    @if(store.error()){<p class="error surface-error">{{store.error()}}</p>}
    <ul class="todo-list">@for(todo of store.items();track todo.id){<li><button class="check" [class.checked]="todo.isCompleted" [disabled]="!auth.can('todos.write')||todo.isCompleted" (click)="store.complete(todo.id)">✓</button><div><strong [class.done]="todo.isCompleted">{{todo.title}}</strong><span>{{todo.createdAtUtc}}</span></div><span class="pill" [class.success]="todo.isCompleted">{{todo.isCompleted?'Done':'Open'}}</span></li>}</ul>
    @if(!store.loading()&&store.items().length===0){<div class="empty-state">No tasks on this page.</div>}
    <div class="pagination">
      <label>Rows<select [ngModel]="store.pageSize()" (ngModelChange)="store.setPageSize(+$event)" [ngModelOptions]="{standalone:true}"><option [value]="5">5</option><option [value]="10">10</option><option [value]="20">20</option></select></label>
      <div class="pagination-pages">
        <button [disabled]="!store.hasPrevious()" (click)="store.setPage(store.page()-1)">Prev</button>
        @for(item of paginationItems();track $index){
          @if(item==='ellipsis'){<span class="pagination-ellipsis">…</span>}
          @else{<button class="page-number" [class.active]="item===store.page()" [attr.aria-current]="item===store.page()?'page':null" (click)="goToPage(item)">{{item}}</button>}
        }
        <button [disabled]="!store.hasNext()" (click)="store.setPage(store.page()+1)">Next</button>
      </div>
    </div>
  </section>`
})
export class TodoPage implements OnInit {
  readonly store = inject(TodoStore);
  readonly auth = inject(AuthSessionService);
  title = '';

  ngOnInit() { void this.store.load(); }

  paginationItems(): PaginationItem[] {
    return buildPaginationItems(this.store.page(), Math.max(this.store.totalPage(), 1));
  }

  goToPage(item: PaginationItem) {
    if (typeof item === 'number') void this.store.setPage(item);
  }

  async create() {
    const value = this.title.trim();
    if (!value) return;
    await this.store.create(value);
    this.title = '';
  }
}
