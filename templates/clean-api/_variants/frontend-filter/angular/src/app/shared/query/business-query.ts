import { buildFilterQuery, type FilterInput } from '../../../lib/filter';

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

export const FILTER_ENABLED=true;

export function buildBusinessListUrl(resource:'products'|'orders'|'employees',query:BusinessListQuery):string {
  const params=new URLSearchParams({page:String(query.page),pageSize:String(query.pageSize)});
  if(query.keyword?.trim())params.set('keyword',query.keyword.trim());
  if(query.targets?.length)params.set('targets',query.targets.join(','));
  if(query.sort?.trim())params.set('sort',query.sort.trim());
  const filterObject:FilterInput={};
  for(const filter of query.filters??[]){
    if(filter.value===''||filter.value===null||filter.value===undefined)continue;
    const current=(filterObject[filter.field]??{}) as Record<string,unknown>;
    current[filter.operator]=filter.value;
    filterObject[filter.field]=current;
  }
  const filterQuery=buildFilterQuery(filterObject);
  const base=`/api/${resource}?${params.toString()}`;
  return filterQuery?`${base}&${filterQuery}`:base;
}

export function buildActiveProductsUrl():string {
  return `/api/products?page=1&pageSize=100&${buildFilterQuery({IsActive:{$eq:true}})}`;
}
