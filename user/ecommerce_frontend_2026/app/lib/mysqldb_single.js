import { apiFetch } from './api';

export default async function getSingleProducts(id) {
  try {
    return await apiFetch(`/singleproducts/${id}`);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
