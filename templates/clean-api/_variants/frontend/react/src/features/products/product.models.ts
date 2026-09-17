export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt: string;
};

export type ProductModel = {
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
};

export type ProductFilterState = {
  keyword: string;
  sort: string;
  active: string;
  lowStock: string;
};

export const emptyProductModel: ProductModel = {
  name: '',
  sku: '',
  price: 0,
  stockQuantity: 0,
  isActive: true,
};
