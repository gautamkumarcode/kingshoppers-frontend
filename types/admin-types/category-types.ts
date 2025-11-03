export interface CategoryResponseType {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentCategory: string;
  level: number;
  categoryPath: string[];
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  commissionPercentage: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
  previewImage:string;
    __v: number;
}
