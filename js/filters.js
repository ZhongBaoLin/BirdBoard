// filters.js - Обробка фільтрів та сортування
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ІНІЦІАЛІЗАЦІЯ ФІЛЬТРІВ ===');
    
    // Перевіряємо, чи ми на головній сторінці з оголошеннями
    const advertisementsSection = document.getElementById('advertisements');
    if (!advertisementsSection) {
        console.log('Секція оголошень не знайдена, вихід з ініціалізації фільтрів');
        return;
    }
    
    // Елементи фільтрів
    const sortOptions = document.querySelectorAll('input[name="sort"]');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const ageFilter = document.getElementById('ageFilter');
    const speciesFilter = document.getElementById('speciesFilter');
    const genderFilter = document.getElementById('genderFilter');
    const healthFilter = document.getElementById('healthFilter');
    const temperFilter = document.getElementById('temperFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Перевіряємо наявність необхідних елементів
    if (!minPriceInput || !maxPriceInput || !applyFiltersBtn) {
        console.log('Не всі необхідні елементи фільтрів знайдені, вихід');
        return;
    }
    
    let currentFilters = {
        sort: 'newest',
        minPrice: 0,
        maxPrice: 5000,
        age: '',
        species: '',
        gender: '',
        health: '',
        temper: ''
    };
    
    let allAdvertisements = [];
    
    // Ініціалізація фільтрів
    async function initFilters() {
        try {
            // Отримуємо всі оголошення
            allAdvertisements = await BirdBoardAPI.getAdvertisements();
            console.log('Отримано оголошень для фільтрів:', allAdvertisements.length);
            
            // Заповнюємо фільтри унікальними значеннями
            populateFilters();
            
            // Встановлюємо значення за замовчуванням
            minPriceInput.value = currentFilters.minPrice;
            maxPriceInput.value = currentFilters.maxPrice;
            
            // Встановлюємо обраний варіант сортування
            const defaultSortOption = document.querySelector(`input[name="sort"][value="${currentFilters.sort}"]`);
            if (defaultSortOption) {
                defaultSortOption.checked = true;
            }
            
            // Застосовуємо фільтри при ініціалізації
            applyFilters();
            
        } catch (error) {
            console.error('Помилка ініціалізації фільтрів:', error);
        }
    }
    
    // Заповнення фільтрів унікальними значеннями
    function populateFilters() {
        const speciesSet = new Set();
        const genderSet = new Set();
        const healthSet = new Set();
        const temperSet = new Set();
        
        allAdvertisements.forEach(ad => {
            if (ad.characteristics) {
                if (ad.characteristics.species) speciesSet.add(ad.characteristics.species);
                if (ad.characteristics.gender) genderSet.add(ad.characteristics.gender);
                if (ad.characteristics.health) healthSet.add(ad.characteristics.health);
                if (ad.characteristics.temper) temperSet.add(ad.characteristics.temper);
            }
        });
        
        // Заповнюємо фільтр видів
        if (speciesFilter) {
            populateSelectFilter(speciesFilter, Array.from(speciesSet).sort());
        }
        
        // Заповнюємо фільтр статі
        if (genderFilter) {
            populateSelectFilter(genderFilter, Array.from(genderSet).sort());
        }
        
        // Заповнюємо фільтр здоров'я
        if (healthFilter) {
            populateSelectFilter(healthFilter, Array.from(healthSet).sort());
        }
        
        // Заповнюємо фільтр характеру
        if (temperFilter) {
            populateSelectFilter(temperFilter, Array.from(temperSet).sort());
        }
    }
    
    // Заповнення випадаючого списку
    function populateSelectFilter(selectElement, options) {
        if (!selectElement) return;
        
        // Зберігаємо поточне значення
        const currentValue = selectElement.value;
        
        // Очищаємо список
        selectElement.innerHTML = '<option value="">Всі</option>';
        
        // Додаємо опції
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
        
        // Відновлюємо вибране значення
        if (currentValue && options.includes(currentValue)) {
            selectElement.value = currentValue;
        }
    }
    
    // Застосування фільтрів
    function applyFilters() {
        // Отримуємо значення сортування
        const selectedSort = document.querySelector('input[name="sort"]:checked');
        if (selectedSort) {
            currentFilters.sort = selectedSort.value;
        }
        
        // Отримуємо ціновий діапазон
        currentFilters.minPrice = parseInt(minPriceInput.value) || 0;
        currentFilters.maxPrice = parseInt(maxPriceInput.value) || 5000;
        
        // Отримуємо інші фільтри
        currentFilters.age = ageFilter ? ageFilter.value : '';
        currentFilters.species = speciesFilter ? speciesFilter.value : '';
        currentFilters.gender = genderFilter ? genderFilter.value : '';
        currentFilters.health = healthFilter ? healthFilter.value : '';
        currentFilters.temper = temperFilter ? temperFilter.value : '';
        
        console.log('Застосовані фільтри:', currentFilters);
        
        // Фільтруємо та сортуємо оголошення
        filterAndSortAdvertisements();
        
        // Показуємо повідомлення про застосування фільтрів
        const filteredCount = getFilteredAdsCount();
        showFilterMessage(`Фільтри застосовано! Знайдено ${filteredCount} оголошень`);
    }
    
    // Скидання фільтрів
    function resetFilters() {
        // Скидаємо значення до початкових
        currentFilters = {
            sort: 'newest',
            minPrice: 0,
            maxPrice: 5000,
            age: '',
            species: '',
            gender: '',
            health: '',
            temper: ''
        };
        
        // Скидаємо UI
        const defaultSortOption = document.querySelector('input[name="sort"][value="newest"]');
        if (defaultSortOption) {
            defaultSortOption.checked = true;
        }
        
        minPriceInput.value = currentFilters.minPrice;
        maxPriceInput.value = currentFilters.maxPrice;
        
        if (ageFilter) ageFilter.value = '';
        if (speciesFilter) speciesFilter.value = '';
        if (genderFilter) genderFilter.value = '';
        if (healthFilter) healthFilter.value = '';
        if (temperFilter) temperFilter.value = '';
        
        console.log('Фільтри скинуто');
        
        // Показуємо всі оголошення
        filterAndSortAdvertisements();
        
        // Показуємо повідомлення
        showFilterMessage('Фільтри скинуто');
    }
    
    // Фільтрація та сортування оголошень
    function filterAndSortAdvertisements() {
        let filteredAds = [...allAdvertisements];
        
        // Фільтрація за ціною
        filteredAds = filteredAds.filter(ad => {
            const price = ad.price || 0;
            return price >= currentFilters.minPrice && price <= currentFilters.maxPrice;
        });
        
        // Фільтрація за віком
        if (currentFilters.age) {
            filteredAds = filteredAds.filter(ad => {
                if (!ad.characteristics || !ad.characteristics.age) return false;
                
                const age = parseInt(ad.characteristics.age);
                switch (currentFilters.age) {
                    case 'baby': return age <= 1;
                    case 'young': return age > 1 && age <= 3;
                    case 'adult': return age > 3;
                    default: return true;
                }
            });
        }
        
        // Фільтрація за видом
        if (currentFilters.species) {
            filteredAds = filteredAds.filter(ad => 
                ad.characteristics && 
                ad.characteristics.species === currentFilters.species
            );
        }
        
        // Фільтрація за статтю
        if (currentFilters.gender) {
            filteredAds = filteredAds.filter(ad => 
                ad.characteristics && 
                ad.characteristics.gender === currentFilters.gender
            );
        }
        
        // Фільтрація за здоров'ям
        if (currentFilters.health) {
            filteredAds = filteredAds.filter(ad => 
                ad.characteristics && 
                ad.characteristics.health === currentFilters.health
            );
        }
        
        // Фільтрація за характером
        if (currentFilters.temper) {
            filteredAds = filteredAds.filter(ad => 
                ad.characteristics && 
                ad.characteristics.temper === currentFilters.temper
            );
        }
        
        // Сортування
        filteredAds.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            
            switch (currentFilters.sort) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                default:
                    return dateB - dateA; // Спочатку новіші
            }
        });
        
        // Відображаємо результати
        displayFilteredAdvertisements(filteredAds);
    }
    
    // Відображення відфільтрованих оголошень
    function displayFilteredAdvertisements(filteredAds) {
        const advertisementsGrid = document.getElementById('advertisementsGrid');
        if (!advertisementsGrid) return;
        
        advertisementsGrid.innerHTML = '';
        
        if (filteredAds.length === 0) {
            advertisementsGrid.innerHTML = `
                <div class="no-ads-message" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p>За вашим запитом оголошень не знайдено</p>
                    <p style="color: #666; margin-top: 10px;">Спробуйте змінити параметри пошуку</p>
                </div>
            `;
        } else {
            filteredAds.forEach(ad => {
                const adElement = createAdElement(ad);
                advertisementsGrid.appendChild(adElement);
            });
            
            // Додаємо обробники кліку
            setTimeout(() => {
                setupAdvertisementClickHandlers();
            }, 100);
        }
        
        // Оновлюємо лічильник
        updateAdsCount(filteredAds.length);
    }
    
    // Створення елементу оголошення
    function createAdElement(advertisement) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const isOwner = currentUser && currentUser.username === advertisement.author?.username;
        
        const adDiv = document.createElement('div');
        adDiv.className = 'advertisement-card';
        adDiv.setAttribute('data-ad-id', advertisement.id);
        
        // Визначаємо шлях до зображення
        let firstImage = '../images/placeholder-bird.jpg';
        if (advertisement.images && advertisement.images.length > 0) {
            if (advertisement.images[0].path) {
                firstImage = `http://localhost:3000${advertisement.images[0].path}`;
            } else if (advertisement.images[0].data) {
                firstImage = advertisement.images[0].data;
            }
        }

        const description = advertisement.description || '';
        const shortDescription = description.length > 100 
            ? description.substring(0, 100) + '...' 
            : description;

        adDiv.innerHTML = `
            <div class="ad-image">
                <img src="${firstImage}" alt="${advertisement.title}" onerror="this.src='../images/placeholder-bird.jpg'">
                ${isOwner ? '<button class="delete-ad-btn" onclick="event.stopPropagation(); confirmDeleteAd(\'' + advertisement.id + '\')">×</button>' : ''}
            </div>
            <div class="ad-content">
                <h4 class="ad-title">${advertisement.title || 'Без назви'}</h4>
                <p class="ad-price">${advertisement.price || 0} грн</p>
                <p class="ad-description">${shortDescription}</p>
                <div class="ad-meta">
                    <div class="meta-row">
                        <span class="ad-species">${advertisement.characteristics?.species || 'Невідомий вид'}</span>
                    </div>
                    <div class="meta-row">
                        <span class="ad-location">
                            <img src="../icons/Геолокація.svg" alt="Місце" class="location-icon">
                            ${advertisement.location || 'Місце не вказано'}
                        </span>
                    </div>
                    <div class="meta-row">
                        <span class="ad-date">
                            <img src="../icons/Календар.svg" alt="Дата" class="date-icon">
                            ${formatDate(advertisement.date)}
                        </span>
                    </div>
                </div>
            </div>
        `;

        adDiv.addEventListener('click', function(e) {
            if (!e.target.closest('.delete-ad-btn')) {
                goToAdvertisement(advertisement.id);
            }
        });

        adDiv.style.cursor = 'pointer';
        return adDiv;
    }
    
    // Форматування дати
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.ceil(diffTime / (1000 * 60));
            
            if (diffMinutes < 60) {
                return `${diffMinutes} хв тому`;
            } else if (diffHours < 24) {
                return `${diffHours} год тому`;
            } else if (diffDays === 1) {
                return 'Сьогодні';
            } else if (diffDays === 2) {
                return 'Вчора';
            } else if (diffDays <= 7) {
                return `${diffDays} днів тому`;
            } else {
                return date.toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            }
        } catch (error) {
            return 'Дата невідома';
        }
    }
    
    // Оновлення лічильника оголошень
    function updateAdsCount(count) {
        const adsCount = document.getElementById('adsCount');
        if (adsCount) {
            adsCount.textContent = `(${count})`;
        }
    }
    
    // Отримання кількості відфільтрованих оголошень
    function getFilteredAdsCount() {
        const adsGrid = document.getElementById('advertisementsGrid');
        if (!adsGrid) return 0;
        const ads = adsGrid.querySelectorAll('.advertisement-card');
        return ads.length;
    }
    
    // Показ повідомлення про фільтри
    function showFilterMessage(message) {
        const existingMessage = document.querySelector('.filter-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'filter-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 3000);
    }
    
    // Додаємо анімації для повідомлень
    const animationStyles = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    
    if (!document.querySelector('#filter-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'filter-animations';
        styleSheet.textContent = animationStyles;
        document.head.appendChild(styleSheet);
    }
    
    // Обробники подій
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Автоматичне застосування фільтрів при зміні сортування
    sortOptions.forEach(option => {
        option.addEventListener('change', applyFilters);
    });
    
    // Ініціалізація фільтрів
    initFilters();
    
    console.log('✅ ФІЛЬТРИ ІНІЦІАЛІЗОВАНО');
});

// Функція для прокручування до оголошень
function scrollToAdvertisements() {
    const advertisementsSection = document.getElementById('advertisements');
    if (advertisementsSection) {
        advertisementsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Експорт функцій для глобального використання
window.setupAdvertisementClickHandlers = function() {
    const adCards = document.querySelectorAll('.advertisement-card');
    
    adCards.forEach(card => {
        const adId = card.getAttribute('data-ad-id');
        
        if (!adId) return;

        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', function(e) {
            if (!e.target.closest('.delete-ad-btn')) {
                goToAdvertisement(adId);
            }
        });
        
        newCard.style.cursor = 'pointer';
    });
};

window.goToAdvertisement = function(adId) {
    if (adId) {
        window.location.href = `./pages/advertisement.html?id=${encodeURIComponent(adId)}`;
    }
};

window.confirmDeleteAd = function(adId) {
    const modal = document.getElementById('deleteAdModal') || createDeleteModal();
    modal.style.display = 'flex';
    modal.setAttribute('data-ad-id', adId);
};

function createDeleteModal() {
    const modal = document.createElement('div');
    modal.id = 'deleteAdModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Видалити оголошення</h3>
            <p>Ви впевнені, що хочете видалити це оголошення? Цю дію неможливо скасувати.</p>
            <div class="modal-actions">
                <button class="modal-btn primary" onclick="deleteAd()">Так, видалити</button>
                <button class="modal-btn secondary close-modal">Скасувати</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}

window.deleteAd = async function() {
    const modal = document.getElementById('deleteAdModal');
    const adId = modal.getAttribute('data-ad-id');
    
    if (!adId) return;
    
    try {
        await BirdBoardAPI.deleteAdvertisement(adId);
        modal.style.display = 'none';
        
        // Перезавантажуємо сторінку для оновлення даних
        location.reload();
    } catch (error) {
        console.error('Помилка видалення:', error);
        alert('Помилка видалення оголошення');
    }
};
