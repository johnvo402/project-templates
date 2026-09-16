export type ListFilter = {
  field:string;
  operator:'$eq'|'$eqi'|'$lte'|'$gte';
  value:string|number|boolean;
};

export type BusinessListQuery = {
  page:number;
  pageSize:number;
  keyword?:string;
  targets?:string[];
  sort?:string;
  filters?:ListFilter[];
};

export const FILTER_ENABLED=false;

export function buildBusinessListUrl(resource:'products'|'orders'|'employees',query:BusinessListQuery):string {
  const params=new URLSearchParams({page:String(query.page),pageSize:String(query.pageSize)});
  return `/api/${resource}?${params.toString()}`;
}

export function buildActiveProductsUrl():string {
  return '/api/products?page=1&pageSize=100&isActive=true';
}
