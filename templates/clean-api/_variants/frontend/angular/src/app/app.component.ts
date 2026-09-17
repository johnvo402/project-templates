import { Component,OnInit,inject,signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSessionService,AuthUser } from './core/auth/auth-session.service';
import { LoginPage } from './features/auth/login.page';
import { AppShellComponent } from './components/app-shell.component';
@Component({selector:'app-root',standalone:true,imports:[LoginPage,AppShellComponent,RouterOutlet],template:`@if(!ready()){<main class="shell"><p>Restoring session…</p></main>}@else if(!auth.user()){<app-login-page (authenticated)="onAuthenticated($event)"/>}@else{<app-shell [user]="auth.user()!" (logout)="onLogout()"><router-outlet/></app-shell>}`})
export class AppComponent implements OnInit{readonly auth=inject(AuthSessionService);readonly ready=signal(false);async ngOnInit(){await this.auth.bootstrap();this.ready.set(true);}onAuthenticated(_user:AuthUser){}async onLogout(){await this.auth.logout();}}
