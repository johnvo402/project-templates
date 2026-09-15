import { Component,OnInit,inject,signal } from '@angular/core';
import { AuthSessionService,AuthUser } from './core/auth/auth-session.service';
import { LoginPage } from './features/auth/login.page';
import { ProfilePage } from './features/profile/profile.page';
import { TodoPage } from './features/todos/todo.page';
import { UsersPage } from './features/users/users.page';
import { AppShellComponent } from './shared/components/app-shell.component';
@Component({selector:'app-root',standalone:true,imports:[LoginPage,ProfilePage,TodoPage,UsersPage,AppShellComponent],template:`@if(!ready()){<main class="shell"><p>Restoring session…</p></main>}@else if(!auth.user()){<app-login-page (authenticated)="onAuthenticated($event)"/>}@else{<app-shell [user]="auth.user()!" (logout)="onLogout()"><app-profile-page/>@if(auth.can('users.read')){<app-users-page/>}@if(auth.can('todos.read')){<app-todo-page/>}</app-shell>}`})
export class AppComponent implements OnInit{readonly auth=inject(AuthSessionService);readonly ready=signal(false);async ngOnInit(){await this.auth.bootstrap();this.ready.set(true);}onAuthenticated(_user:AuthUser){}async onLogout(){await this.auth.logout();}}
