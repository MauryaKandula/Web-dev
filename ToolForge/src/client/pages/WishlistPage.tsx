import React from 'react';
import { Product } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { Heart, ShoppingBag } from 'lucide-react';

interface WishlistPageProps {
  wishlist: Product[];
  ownedProductIds: Set<string>;
  onBuy: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onExplore: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlist,
  ownedProductIds,
  onBuy,
  onToggleWishlist,
  onSelectProduct,
  onExplore
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Saved Wishlist</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Software tools and scripts you have bookmarked for future workflows.
            </p>
          </div>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Your wishlist is currently empty</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Explore affordable CLI utilities, AI workflow templates, and web scripts to build your custom toolset.
          </p>
          <button
            onClick={onExplore}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Marketplace</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isOwned={ownedProductIds.has(product.id)}
              isWishlisted={true}
              onBuy={onBuy}
              onToggleWishlist={onToggleWishlist}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
