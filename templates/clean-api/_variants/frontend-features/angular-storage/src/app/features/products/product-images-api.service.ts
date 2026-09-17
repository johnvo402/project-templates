import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../core/api/api.models';

export type ProductImage = { id:string; url:string; isPrimary:boolean; createdAt:string };

@Injectable({providedIn:'root'})
export class ProductImagesApiService {
  private readonly http=inject(HttpClient);
  list(productId:string):Observable<ProductImage[]>{return this.http.get<ApiResponse<ProductImage[]>>(`/api/products/${productId}/images`).pipe(map(response=>response.results));}
  upload(productId:string,file:File):Observable<ProductImage>{const form=new FormData();form.append('file',file);return this.http.post<ApiResponse<ProductImage>>(`/api/products/${productId}/images`,form).pipe(map(response=>response.results));}
  deleteImage(productId:string,imageId:string):Observable<void>{return this.http.delete<void>(`/api/products/${productId}/images/${imageId}`);}
  setPrimary(productId:string,imageId:string):Observable<void>{return this.http.put<void>(`/api/products/${productId}/images/${imageId}/primary`,{});}
}
