const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getAdmins() {

    const response = await fetch(`${API_URL}/admin`, {
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error('Failed to load admins')
    }

    return response.json()
}