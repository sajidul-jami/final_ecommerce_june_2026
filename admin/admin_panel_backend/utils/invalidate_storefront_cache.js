const fs = require('node:fs/promises');
const path = require('node:path');

async function revalidateNextCache() {
    const secret = process.env.PRODUCT_CACHE_REVALIDATION_SECRET;
    const url = process.env.PRODUCT_CACHE_REVALIDATION_URL;
    if (!secret || !url) return;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { authorization: `Bearer ${secret}` },
            signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) console.error(`Storefront cache revalidation failed: HTTP ${response.status}`);
    } catch (error) {
        console.error('Storefront cache revalidation request failed:', error.message);
    }
}

async function clearNginxCache() {
    const cacheRoot = process.env.NGINX_PRODUCT_CACHE_PATH || '/var/cache/nginx/product-pages';

    async function clearDirectory(directory) {
        for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) await clearDirectory(entryPath);
            else await fs.unlink(entryPath);
        }
    }

    try {
        await clearDirectory(cacheRoot);
    } catch (error) {
        if (error.code !== 'ENOENT') console.error('Nginx storefront cache purge failed:', error.message);
    }
}

module.exports = async function invalidateStorefrontCache() {
    await Promise.all([revalidateNextCache(), clearNginxCache()]);
};
