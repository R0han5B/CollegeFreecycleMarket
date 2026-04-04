'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Item } from '@/types';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/item/${item.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square bg-gray-100">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-4xl font-bold text-gray-300">
                {item.title.charAt(0)}
              </span>
            </div>
          )}
          {item.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-orange-500">
              Featured
            </Badge>
          )}
          {item.isSold && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              Sold
            </Badge>
          )}
          {item.price === 0 && !item.isSold && (
            <Badge className="absolute bottom-2 left-2 bg-green-500">
              Free
            </Badge>
          )}
        </div>

        <CardContent className="p-4 flex-1">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {item.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Badge variant="outline" className="text-xs">
              {item.category?.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.condition}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <UserIcon className="h-4 w-4" />
            <span className="truncate max-w-[100px]">
              {item.seller?.name || item.seller?.email?.split('@')[0]}
            </span>
          </div>
          <div className="font-bold text-lg text-orange-600">
            {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
