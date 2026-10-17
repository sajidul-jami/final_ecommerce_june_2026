import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';

const secret = process.env.PRODUCT_CACHE_REVALIDATION_SECRET;

export async function POST(request) {
  if (!secret) {
    return Response.json({ error: 'Cache revalidation is not configured' }, { status: 503 });
  }

  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!supplied || Buffer.byteLength(supplied) !== Buffer.byteLength(secret) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag('products', { expire: 0 });
  revalidateTag('product-list', { expire: 0 });
  revalidatePath('/');
  return Response.json({ revalidated: true });
}
