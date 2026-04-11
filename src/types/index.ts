export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  isAdmin: boolean;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  image: string | null;
  isFeatured: boolean;
  isSold: boolean;
  categoryId: string;
  sellerId: string;
  createdAt: Date;
  category?: Category;
  seller?: User;
}

export interface Message {
  id: string;
  content: string | null;
  senderId: string;
  receiverId: string;
  itemId: string;
  imageUrl: string | null;
  read: boolean;
  createdAt: Date;
  sender?: User;
  receiver?: User;
}

export interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  raterId: string;
  ratedId: string;
  itemId: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  buyerId: string;
  sellerId: string;
  itemId: string;
  status: string;
  createdAt: Date;
}

export interface Watchlist {
  id: string;
  userId: string;
  itemId: string;
  createdAt: Date;
  item?: Item;
}

export interface Report {
  id: string;
  reason: string;
  status: string;
  userId: string;
  itemId: string;
}
