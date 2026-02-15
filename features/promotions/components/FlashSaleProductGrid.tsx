import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FlashSaleProductVO } from '../types';
import { ArrowRight } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const FlashSaleProductGrid: React.FC<{ products: FlashSaleProductVO[] }> = ({ products }) => {
    return (
        <div className="space-y-16">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
                {products.slice(0, 15).map((product) => (
                    <motion.div key={product.id} variants={itemVariants}>
                        <Link
                            href={`/product/${product.productId}`}
                            className="group flex flex-col transition-all duration-500"
                        >
                            <div className="relative aspect-square overflow-hidden bg-white border border-zinc-200/60 rounded-sm">
                                <Image
                                    src={product.imageUrl || product.image || '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Sold Out Overlay */}
                                {product.stockStatus === '售罄' && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                        <span className="text-white text-[11px] font-bold tracking-[0.3em] border border-white/40 px-6 py-2 uppercase">
                                            Sold Out
                                        </span>
                                    </div>
                                )}

                                {/* Status Stickers */}
                                <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1.5">
                                    <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest shadow-lg">
                                        {product.discountLabel || product.discountRateDisplay || 'Sale'}
                                    </div>
                                    {product.flashSalePrice && (
                                        <div className="bg-white/90 backdrop-blur-sm text-zinc-900 border border-zinc-200 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tight">
                                            Flash Session
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="py-5 px-1 flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest mb-1 group-hover:text-zinc-500 transition-colors">
                                        Product Ref. #{product.productId}
                                    </span>
                                    <h3 className="text-[15px] text-zinc-900 font-bold tracking-tight mb-2 group-hover:text-zinc-600 transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-lg font-bold text-zinc-900 font-mono tracking-tighter">
                                        NT$ {(product.flashPrice || product.flashSalePrice || 0).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-zinc-300 line-through font-mono font-medium">
                                        NT$ {product.originalPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {products.length > 15 && (
                <div className="flex justify-center border-t border-zinc-100 pt-12">
                    <Link
                        href={`/products?flash-sale=true`}
                        className="group flex items-center gap-3 text-sm font-bold text-zinc-900 uppercase tracking-[0.2em] px-8 py-4 border border-zinc-200 rounded-full hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300"
                    >
                        Explore Complete Collection ({products.length})
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
                    </Link>
                </div>
            )}
        </div>
    );
};
