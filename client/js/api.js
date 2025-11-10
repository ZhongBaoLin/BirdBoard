// client/js/api.js
const API_BASE_URL = 'http://localhost:3000/api';

class BirdBoardAPI {
    
    // --- Оголошення (CRUD) ---
    
    static async getAdvertisements() {
        try {
            const response = await fetch(`${API_BASE_URL}/advertisements`);
            if (!response.ok) throw new Error(`Помилка отримання оголошень: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('API Error (getAdvertisements):', error);
            // Fallback до LocalStorage (якщо LocalStorage ще використовується)
            return JSON.parse(localStorage.getItem('advertisements')) || [];
        }
    }

    static async getAdvertisementById(adId) {
        try {
            const response = await fetch(`${API_BASE_URL}/advertisements/${adId}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Оголошення не знайдено');
                throw new Error(`Помилка отримання оголошення: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error (getAdvertisementById):', error);
            const localAds = JSON.parse(localStorage.getItem('advertisements')) || [];
            return localAds.find(ad => ad.id === adId) || null;
        }
    }
    
    static async createAdvertisement(adData) {
        const response = await fetch(`${API_BASE_URL}/advertisements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adData)
        });
        if (!response.ok) throw new Error(`Помилка створення оголошення: ${response.statusText}`);
        return await response.json();
    }
    
    static async updateAdvertisement(adId, adData) {
        const response = await fetch(`${API_BASE_URL}/advertisements/${adId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adData)
        });
        if (!response.ok) throw new Error(`Помилка оновлення оголошення: ${response.statusText}`);
        return await response.json();
    }
    
    static async deleteAdvertisement(adId) {
        const response = await fetch(`${API_BASE_URL}/advertisements/${adId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Помилка видалення оголошення: ${response.statusText}`);
        return true;
    }
    
    // --- Пошук та Статистика ---
    
    static async searchAdvertisements(filters) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
        if (!response.ok) throw new Error(`Помилка пошуку: ${response.statusText}`);
        return await response.json();
    }
    
    static async getSpeciesStatistics() {
        const response = await fetch(`${API_BASE_URL}/statistics/species`);
        if (!response.ok) throw new Error(`Помилка отримання статистики: ${response.statusText}`);
        return await response.json();
    }
}