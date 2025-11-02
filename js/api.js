// js/api.js
class BirdBoardAPI {
    // Використовуємо відносний шлях замість localhost
    static getBaseURL() {
        // Якщо сервер запущений, використовуємо відносний шлях
        return window.location.origin + '/api';
    }

    static async getAdvertisements() {
        try {
            const response = await fetch('/api/advertisements');
            if (!response.ok) throw new Error('Помилка отримання оголошень');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback до LocalStorage
            return JSON.parse(localStorage.getItem('advertisements')) || [];
        }
    }

    static async getAdvertisementById(adId) {
        try {
            const response = await fetch(`/api/advertisements/${adId}`);
            if (!response.ok) throw new Error('Оголошення не знайдено');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback до LocalStorage
            const localAds = JSON.parse(localStorage.getItem('advertisements')) || [];
            return localAds.find(ad => ad.id === adId) || null;
        }
    }

    static async createAdvertisement(adData) {
        try {
            const formData = new FormData();
            
            Object.keys(adData).forEach(key => {
                if (key !== 'images') {
                    formData.append(key, typeof adData[key] === 'object' ? JSON.stringify(adData[key]) : adData[key]);
                }
            });
            
            if (adData.images && adData.images.length > 0) {
                adData.images.forEach(image => {
                    const file = this.dataURLtoFile(image.data, image.name);
                    formData.append('images', file);
                });
            }

            const response = await fetch('/api/advertisements', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Помилка створення оголошення');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback до LocalStorage
            const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
            const newAd = {
                ...adData,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString(),
                views: 0
            };
            advertisements.unshift(newAd);
            localStorage.setItem('advertisements', JSON.stringify(advertisements));
            return newAd;
        }
    }

    static async updateAdvertisement(adId, adData) {
        try {
            const formData = new FormData();
            
            Object.keys(adData).forEach(key => {
                if (key !== 'images') {
                    formData.append(key, typeof adData[key] === 'object' ? JSON.stringify(adData[key]) : adData[key]);
                }
            });
            
            if (adData.images && adData.images.length > 0) {
                adData.images.forEach(image => {
                    if (image.data && !image.path) {
                        const file = this.dataURLtoFile(image.data, image.name);
                        formData.append('images', file);
                    }
                });
            }

            const response = await fetch(`/api/advertisements/${adId}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Помилка оновлення оголошення');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async deleteAdvertisement(adId) {
        try {
            const response = await fetch(`/api/advertisements/${adId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Помилка видалення');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback до LocalStorage
            const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
            const adIndex = advertisements.findIndex(ad => ad.id === adId);
            if (adIndex !== -1) {
                advertisements.splice(adIndex, 1);
                localStorage.setItem('advertisements', JSON.stringify(advertisements));
            }
            return { message: 'Оголошення видалено' };
        }
    }

    static async searchAdvertisements(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });

            const response = await fetch(`/api/advertisements/search?${params}`);
            if (!response.ok) throw new Error('Помилка пошуку');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback до LocalStorage
            const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
            return this.filterAdvertisementsLocal(advertisements, filters);
        }
    }

    static async getSpeciesStatistics() {
        try {
            const response = await fetch('/api/statistics/species');
            if (!response.ok) throw new Error('Помилка отримання статистики');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback до LocalStorage
            const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
            return this.getSpeciesStatsLocal(advertisements);
        }
    }

    // Допоміжні функції для LocalStorage fallback
    static filterAdvertisementsLocal(ads, filters) {
        let filtered = [...ads];
        
        if (filters.city) {
            filtered = filtered.filter(ad => 
                ad.location && ad.location.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        if (filters.species) {
            filtered = filtered.filter(ad => 
                ad.characteristics && 
                ad.characteristics.species && 
                ad.characteristics.species.toLowerCase().includes(filters.species.toLowerCase())
            );
        }

        if (filters.gender) {
            filtered = filtered.filter(ad => 
                ad.characteristics && 
                ad.characteristics.gender && 
                ad.characteristics.gender.toLowerCase() === filters.gender.toLowerCase()
            );
        }

        if (filters.query) {
            const searchTerm = filters.query.toLowerCase();
            filtered = filtered.filter(ad => 
                (ad.title && ad.title.toLowerCase().includes(searchTerm)) ||
                (ad.description && ad.description.toLowerCase().includes(searchTerm))
            );
        }

        return filtered;
    }

    static getSpeciesStatsLocal(ads) {
        const speciesCount = {};
        ads.forEach(ad => {
            if (ad.characteristics && ad.characteristics.species) {
                const species = ad.characteristics.species;
                speciesCount[species] = (speciesCount[species] || 0) + 1;
            }
        });
        return speciesCount;
    }

    static dataURLtoFile(dataURL, filename) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], filename, { type: mime });
    }
}