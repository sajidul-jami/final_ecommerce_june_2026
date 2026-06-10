'use client';

import { useEffect, useState } from 'react';
import Cards from '@/app/components/cards';
import getAllProducts from '@/app/lib/mysqldb';

export default function RelatedProducts({ categoryId, currentId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await getAllProducts(categoryId ? { category: categoryId, limit: 5 } : { limit: 5 });
        setProducts(data.filter((product) => Number(product.id) !== Number(currentId)).slice(0, 5));
      } catch (error) {
        console.error(error);
      }
    };

    fetchRelated();
  }, [categoryId, currentId]);

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-slate-950">Related Products</h2>
      <Cards products={products} />
    </section>
  );
}
