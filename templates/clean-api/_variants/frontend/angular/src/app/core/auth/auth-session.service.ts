import { computed, inject, Injectable, signal } from '@angular/core';
import { API_ROUTES } from '../api/api.routes';
import { ApiResponse } from '../api/api.models';
import { configureCurrency } from '../../utils/formatters';
import { AccessTokenStore } from './access-token.store';

export type AuthUser = { id:string; email:string; displayName:string; role:string; permissions:string[] };
type AuthTokenResponse = { accessToken:string; accessTokenExpiresAtUtc:string; user:AuthUser };
type DisplaySettingsResponse = { currency:string; timezone:string };

@Injectable({ providedIn:'root' })
export class AuthSessionService {
  private readonly tokens=inject(AccessTokenStore);
  private readonly userState=signal<AuthUser|null>(null);
  private refreshPromise:Promise<AuthUser|null>|null=null;
  readonly user=this.userState.asReadonly();
  readonly isAuthenticated=computed(()=>this.tokens.get()!==null&&this.userState()!==null);

  login(email:string,password:string){return this.authenticate(API_ROUTES.auth.login,{email,password});}
  register(email:string,password:string,displayName:string){return this.authenticate(API_ROUTES.auth.register,{email,password,displayName});}

  refresh():Promise<AuthUser|null>{
    if(this.refreshPromise)return this.refreshPromise;
    this.refreshPromise=(async()=>{
      const r=await fetch(API_ROUTES.auth.refresh,{method:'POST',credentials:'include'});
      if(!r.ok){this.clear();return null;}
      const e=await r.json() as ApiResponse<AuthTokenResponse>;
      this.setSession(e.results);
      await this.loadDisplaySettings();
      return e.results.user;
    })().finally(()=>this.refreshPromise=null);
    return this.refreshPromise;
  }

  async logout(){try{await fetch(API_ROUTES.auth.logout,{method:'POST',credentials:'include'});}finally{this.clear();}}
  bootstrap(){const current=this.userState();return current?Promise.resolve(current):this.refresh();}
  can(permission:string){return this.userState()?.permissions.includes(permission)??false;}
  updateDisplayName(displayName:string){const current=this.userState();if(current)this.userState.set({...current,displayName});}

  private async authenticate(path:string,payload:{email:string;password:string;displayName?:string}){
    const r=await fetch(path,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const body=await r.json();
    if(!r.ok)throw new Error(body?.detail??body?.title??body?.message??'Authentication failed.');
    const e=body as ApiResponse<AuthTokenResponse>;
    this.setSession(e.results);
    await this.loadDisplaySettings();
    return e.results.user;
  }

  private async loadDisplaySettings():Promise<void>{
    const token=this.tokens.get();
    if(!token)return;
    try{
      const response=await fetch(API_ROUTES.settingsDisplay,{credentials:'include',headers:{Authorization:`Bearer ${token}`}});
      if(!response.ok)return;
      const envelope=await response.json() as ApiResponse<DisplaySettingsResponse>;
      configureCurrency(envelope.results.currency);
    }catch{
      // Formatting keeps the VND default if display preferences are temporarily unavailable.
    }
  }

  private setSession(session:AuthTokenResponse){this.tokens.set(session.accessToken);this.userState.set(session.user);}
  private clear(){this.tokens.clear();this.userState.set(null);configureCurrency('VND');}
}
