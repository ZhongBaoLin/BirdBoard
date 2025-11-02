// Запобігання безкінечним циклам
let logoutInProgress = false;
let updateHeaderInProgress = false;

// Масив для зберігання користувачів
let users = JSON.parse(localStorage.getItem('users')) || [];

// Поточний користувач
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Функція для збереження даних
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Функція для відображення помилок
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background: #ffebee;
        color: #c62828;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        text-align: center;
    `;
    
    const form = document.getElementById('authForm');
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    form.insertBefore(errorDiv, form.firstChild);
}

// Функція для реєстрації
function register(userData) {
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
        showError('Цей логін вже зайнятий');
        return false;
    }

    users.push(userData);
    currentUser = userData;
    saveData();
    return true;
}

// Функція для входу
function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        saveData();
        return true;
    }
    return false;
}

function logout() {
    console.log('logout called');
    
    if (!currentUser) {
        console.log('Користувач вже вийшов, вихід з функції');
        return;
    }
    
    currentUser = null;
    saveData();
    
    const isProfilePage = window.location.pathname.includes('profile.html');
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    if (isProfilePage) {
        window.location.href = '../index.html';
    } else if (isAuthPage) {
        return;
    } else {
        updateHeader();
    }
}

// Функція для оновлення хедера
function updateHeader() {
    const accountBtn = document.querySelector('.header__account a');
    if (!accountBtn) {
        console.log('header__account не знайдено');
        return;
    }

    console.log('updateHeader called, currentUser:', currentUser);
    
    if (currentUser) {
        let avatarHTML = '';
        
        if (currentUser.avatar) {
            avatarHTML = `<img src="${currentUser.avatar}" alt="Аватар" class="user-avatar-img">`;
        } else {
            const firstLetter = currentUser.username.charAt(0).toUpperCase();
            avatarHTML = `<div class="user-avatar">${firstLetter}</div>`;
        }
        
        accountBtn.innerHTML = `${avatarHTML}${currentUser.username}`;
        
        if (!accountBtn.parentNode.querySelector('.dropdown-menu')) {
            addDropdownMenu();
        }
    } else {
        console.log('Встановлення стану для неавторизованого користувача');
        accountBtn.innerHTML = `<img src="./icons/Аккаунт чорний.svg" alt="">Ваш профіль`;
        accountBtn.href = "./pages/auth.html";
        
        const dropdown = accountBtn.parentNode.querySelector('.dropdown-menu');
        if (dropdown) {
            dropdown.remove();
        }
        
        accountBtn.onclick = null;
    }
}

// Додавання випадаючого меню
function addDropdownMenu() {
    const accountBtn = document.querySelector('.header__account');
    if (!accountBtn || !currentUser) {
        console.log('addDropdownMenu: умови не виконані');
        return;
    }
    
    console.log('Додавання випадаючого меню');
    
    const existingDropdown = accountBtn.querySelector('.dropdown-menu');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    dropdown.innerHTML = `
        <button onclick="window.location.href='../pages/profile.html'">Мій профіль</button>
        <button onclick="logout()">Вийти з аккаунту</button>
    `;
    
    accountBtn.style.position = 'relative';
    accountBtn.appendChild(dropdown);
    
    accountBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Клік по header__account');
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function(e) {
        if (!accountBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Обробка форми реєстрації/входу
if (document.getElementById('authForm')) {
    const authForm = document.getElementById('authForm');
    let switchLink = document.getElementById('switchLink');
    const authTitle = document.getElementById('authTitle');
    const switchText = document.getElementById('switchText');
    
    let isLoginMode = !window.location.pathname.includes('auth.html');

    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            authTitle.textContent = 'Вхід';
            switchText.innerHTML = 'Ще не маєте аккаунт? <a href="#" id="switchLink">Зареєструватися</a>';
            authForm.innerHTML = `
                <div class="auth__group">
                    <input type="text" id="username" placeholder="Логін" required>
                    <input type="password" id="password" placeholder="Пароль" required>
                </div>
                <button type="submit">Увійти</button>
            `;
        } else {
            authTitle.textContent = 'Реєстрація';
            switchText.innerHTML = 'Вже маєте аккаунт? <a href="#" id="switchLink">Увійти</a>';
            authForm.innerHTML = `
                <div class="auth__group auth__extra">
                    <input type="text" id="lastName" placeholder="Прізвище" required>
                    <input type="text" id="firstName" placeholder="Ім'я" required>
                    <input type="text" id="middleName" placeholder="По батькові" required>
                    <input type="tel" id="phone" placeholder="Номер телефону" required>
                    <input type="email" id="email" placeholder="Email" required>
                </div>
                <div class="auth__group">
                    <input type="text" id="username" placeholder="Логін" required>
                    <input type="password" id="password" placeholder="Пароль" required>
                </div>
                <button type="submit">Зареєструватися</button>
            `;
        }
        
        setTimeout(() => {
            const newSwitchLink = document.getElementById('switchLink');
            if (newSwitchLink) {
                newSwitchLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    toggleAuthMode();
                });
            }
        }, 0);
    }

    if (switchLink) {
        switchLink.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAuthMode();
        });
    }

    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (isLoginMode) {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (login(username, password)) {
                window.location.href = '../index.html';
            } else {
                showError('Невірний логін або пароль');
            }
        } else {
            const userData = {
                lastName: document.getElementById('lastName').value,
                firstName: document.getElementById('firstName').value,
                middleName: document.getElementById('middleName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };
            
            if (register(userData)) {
                window.location.href = '../index.html';
            }
        }
    });
}

// Функції для аватарки
function uploadAvatar(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarData = e.target.result;
            
            if (currentUser) {
                currentUser.avatar = avatarData;
                
                const userIndex = users.findIndex(u => u.username === currentUser.username);
                if (userIndex !== -1) {
                    users[userIndex].avatar = avatarData;
                    saveData();
                    updateHeader();
                    resolve(avatarData);
                }
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function removeAvatar() {
    if (currentUser) {
        currentUser.avatar = null;
        
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].avatar = null;
            saveData();
            updateHeader();
        }
    }
}

// Функції для оголошень
function checkAuthForAd() {
    if (!currentUser) {
        showAuthModal();
        return false;
    }
    window.location.href = './pages/add-advertisement.html';
    return true;
}

function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function initAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeAuthModal);
        }
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAuthModal();
            }
        });
    }
}

// Функція для відображення оголошень
async function displayAdvertisements() {
    const advertisementsGrid = document.getElementById('advertisementsGrid');
    if (!advertisementsGrid) return;

    try {
        const advertisements = await BirdBoardAPI.getAdvertisements();
        console.log('Оголошення з сервера:', advertisements);

        updateAdsCount(advertisements.length);

        if (advertisements.length === 0) {
            advertisementsGrid.innerHTML = `
                <div class="no-ads-message">
                    <p>Поки що немає оголошень. Будьте першим, хто додасть оголошення!</p>
                </div>
            `;
            return;
        }

        advertisementsGrid.innerHTML = '';
        advertisements.forEach(ad => {
            const adElement = createAdElement(ad);
            advertisementsGrid.appendChild(adElement);
        });

        setTimeout(() => {
            setupAdvertisementClickHandlers();
        }, 100);
        
    } catch (error) {
        console.error('Помилка завантаження оголошень:', error);
        advertisementsGrid.innerHTML = `
            <div class="no-ads-message">
                <p>Помилка завантаження оголошень. Спробуйте оновити сторінку.</p>
            </div>
        `;
    }
}

function createAdElement(advertisement) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isOwner = currentUser && currentUser.username === advertisement.author.username;
    
    const adDiv = document.createElement('div');
    adDiv.className = 'advertisement-card';
    adDiv.setAttribute('data-ad-id', advertisement.id);
    
    // Визначаємо шлях до зображення
    let firstImage = '../images/placeholder-bird.jpg';
    if (advertisement.images && advertisement.images.length > 0) {
        if (advertisement.images[0].path) {
            // Серверне зображення
            firstImage = `http://localhost:3000${advertisement.images[0].path}`;
        } else if (advertisement.images[0].data) {
            // LocalStorage зображення (data URL)
            firstImage = advertisement.images[0].data;
        }
    }

    // Створюємо короткий опис
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
            console.log('Прямий клік по картці з ID:', advertisement.id);
            goToAdvertisement(advertisement.id);
        }
    });

    adDiv.style.cursor = 'pointer';

    return adDiv;
}

function goToAdvertisement(adId) {
    console.log('Перехід на оголошення з ID:', adId);
    if (adId) {
        window.location.href = `./pages/advertisement.html?id=${encodeURIComponent(adId)}`;
    } else {
        console.error('ID оголошення не визначено');
    }
}

function setupAdvertisementClickHandlers() {
    const adCards = document.querySelectorAll('.advertisement-card');
    console.log('Знайдено карток для обробників кліку:', adCards.length);
    
    adCards.forEach(card => {
        const adId = card.getAttribute('data-ad-id');
        console.log('Картка має ID:', adId);
        
        if (!adId) {
            console.warn('Картка без ID:', card);
            return;
        }

        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', function(e) {
            if (!e.target.closest('.delete-ad-btn')) {
                console.log('Клік по картці з ID:', adId);
                goToAdvertisement(adId);
            }
        });
        
        newCard.style.cursor = 'pointer';
    });
}

// Функції для видалення оголошень
function confirmDeleteAd(adId) {
    const modal = document.getElementById('deleteAdModal') || createDeleteModal();
    modal.style.display = 'flex';
    modal.setAttribute('data-ad-id', adId);
}

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

function deleteAd() {
    const modal = document.getElementById('deleteAdModal');
    const adId = modal.getAttribute('data-ad-id');
    
    if (!adId) return;
    
    const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const adIndex = advertisements.findIndex(ad => ad.id === adId);
    
    if (adIndex === -1) {
        alert('Оголошення не знайдено');
        return;
    }
    
    const advertisement = advertisements[adIndex];
    
    if (!currentUser || currentUser.username !== advertisement.author.username) {
        alert('У вас немає прав для видалення цього оголошення');
        return;
    }
    
    advertisements.splice(adIndex, 1);
    localStorage.setItem('advertisements', JSON.stringify(advertisements));
    
    modal.style.display = 'none';
    displayAdvertisements();
    updateAdsCount();
    showMessage('Оголошення успішно видалено', 'success');

        advertisements.splice(adIndex, 1);
    localStorage.setItem('advertisements', JSON.stringify(advertisements));
    
    modal.style.display = 'none';
    displayAdvertisements();
    updateAdsCount();
    updatePopularSpecies(); // Додано цей рядок
    showMessage('Оголошення успішно видалено', 'success');
}

// Допоміжні функції
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

function showMessage(message, type = 'info') {
    let messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        messageContainer.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
        `;
        document.body.appendChild(messageContainer);
    }
    
    messageContainer.innerHTML = '';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ad-message ad-message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        padding: 15px 20px;
        margin: 10px 0;
        border-radius: 10px;
        font-weight: 600;
        text-align: center;
        box-sizing: border-box;
        background: ${type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 
                   type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 
                   'rgba(33, 150, 243, 0.1)'};
        color: ${type === 'success' ? '#2e7d32' : 
                type === 'error' ? '#c62828' : 
                '#1565c0'};
        border: 1px solid ${type === 'success' ? '#4caf50' : 
                          type === 'error' ? '#f44336' : 
                          '#2196f3'};
        animation: slideDown 0.3s ease;
    `;
    
    messageContainer.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authStatusElement = document.getElementById('authStatus');
    
    if (!authStatusElement) return;
    
    if (currentUser) {
        authStatusElement.innerHTML = `
            <div style="background: #e8f5e8; color: #2e7d32; padding: 10px; text-align: center;">
                Ви увійшли як ${currentUser.username}
            </div>
        `;
        updateHeader(currentUser);
    } else {
        authStatusElement.innerHTML = '';
    }
}

// Функція для оновлення кількості оголошень
function updateAdsCount(count = null) {
    const adsCountElement = document.getElementById('adsCount');
    if (adsCountElement) {
        if (count !== null) {
            adsCountElement.textContent = `(${count})`;
        } else {
            const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
            adsCountElement.textContent = `(${advertisements.length})`;
        }
        console.log('Лічильник оновлено:', adsCountElement.textContent);
    }
}

// Функції для пошуку
function getUniqueCities() {
    const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
    const cities = advertisements
        .map(ad => ad.location)
        .filter(city => city && city.trim() !== '')
        .filter((city, index, array) => array.indexOf(city) === index)
        .sort();
    
    return cities;
}

function updateCitySelect() {
    const citySelect = document.getElementById('citySelect') || document.querySelector('.search__select:first-child');
    if (!citySelect) {
        console.error('Не знайдено випадаючий список міст');
        return;
    }
    
    const placeholderOption = citySelect.querySelector('option[value=""]');
    citySelect.innerHTML = '';
    
    if (placeholderOption) {
        citySelect.appendChild(placeholderOption);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Місто';
        citySelect.appendChild(defaultOption);
    }
    
    const cities = getUniqueCities();
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    console.log('Оновлено список міст:', cities);
}

function searchAdvertisements() {
    const citySelect = document.getElementById('citySelect') || document.querySelector('.search__select:first-child');
    const searchInput = document.getElementById('searchInput') || document.querySelector('.search__input');
    const genderSelect = document.getElementById('genderSelect') || document.querySelector('.search__select:last-child');
    
    const selectedCity = citySelect ? citySelect.value : '';
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedGender = genderSelect ? genderSelect.value : '';
    
    const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
    
    console.log('=== ПОШУК ===');
    console.log('Місто:', selectedCity);
    console.log('Запит:', searchTerm);
    console.log('Стать:', selectedGender);
    
    const filteredAds = advertisements.filter(ad => {
        if (selectedCity && ad.location !== selectedCity) {
            return false;
        }
        
        if (searchTerm && !ad.title.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        if (selectedGender) {
            const adGender = ad.characteristics.gender;
            
            if (!adGender || adGender === 'Не ' || adGender === '') {
                return false;
            }
            
            if (adGender !== selectedGender) {
                return false;
            }
        }
        
        return true;
    });
    
    console.log('Знайдено:', filteredAds.length, 'оголошень');
    return filteredAds;
}

function displaySearchResults(filteredAds) {
    const advertisementsGrid = document.getElementById('advertisementsGrid');
    if (!advertisementsGrid) return;
    
    if (filteredAds.length === 0) {
        advertisementsGrid.innerHTML = `
            <div class="no-ads-message" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>За вашим запитом оголошень не знайдено</p>
                <p style="color: #666; margin-top: 10px;">Спробуйте змінити параметри пошуку</p>
            </div>
        `;
        return;
    }
    
    advertisementsGrid.innerHTML = '';
    
    filteredAds.forEach(ad => {
        const adElement = createAdElement(ad);
        advertisementsGrid.appendChild(adElement);
    });
    
    updateAdsCount(filteredAds.length);
    
    setTimeout(() => {
        setupAdvertisementClickHandlers();
    }, 100);
    

}

function initSearch() {
    const searchForm = document.querySelector('.search__form');
    if (!searchForm) {
        console.log('Форма пошуку не знайдена (це нормально для цієї сторінки)');
        return;
    }
    
    updateCitySelect();
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const results = searchAdvertisements();
        displaySearchResults(results);
        
        const adsSection = document.getElementById('advertisements');
        if (adsSection) {
            adsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    const searchInput = document.getElementById('searchInput') || document.querySelector('.search__input');
    const citySelect = document.getElementById('citySelect') || document.querySelector('.search__select:first-child');
    const genderSelect = document.getElementById('genderSelect') || document.querySelector('.search__select:last-child');
    
    [searchInput, citySelect, genderSelect].forEach(element => {
        if (element) {
            element.addEventListener('change', function() {
                const results = searchAdvertisements();
                displaySearchResults(results);
            });
            
            element.addEventListener('input', function() {
                if (element.type === 'text') {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        const results = searchAdvertisements();
                        displaySearchResults(results);
                    }, 500);
                }
            });
        }
    });
}

// Головна функція ініціалізації
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ІНІЦІАЛІЗАЦІЯ СИСТЕМИ ===');
    console.log('Поточний користувач:', currentUser);
    
    if (window.initializationInProgress) {
        console.log('Ініціалізація вже виконується, вихід');
        return;
    }
    
    window.initializationInProgress = true;
    
    try {
        updateHeader();
        initAuthModal();
        displayAdvertisements();
        updateAdsCount();
        checkAuthStatus();
        initSearch();
        updatePopularSpecies(); // Додано цей рядок
        
        const addAdBtn = document.querySelector('.header__btn a');
        if (addAdBtn) {
            addAdBtn.addEventListener('click', function(e) {
                e.preventDefault();
                checkAuthForAd();
            });
        }
        
        console.log('Ініціалізація завершена успішно');
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
    } finally {
        window.initializationInProgress = false;
    }
});

// Функція для підрахунку оголошень за видами папуг
function countAdsBySpecies() {
    const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
    const speciesCount = {};
    
    advertisements.forEach(ad => {
        const species = ad.characteristics.species;
        if (species) {
            speciesCount[species] = (speciesCount[species] || 0) + 1;
        }
    });
    
    return speciesCount;
}

// Функція для отримання правильного закінчення
function getAdsEnding(count) {
    if (count % 10 === 1 && count % 100 !== 11) {
        return 'оголошення';
    } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
        return 'оголошення';
    } else {
        return 'оголошень';
    }
}

// Функція для оновлення відображення популярних видів
async function updatePopularSpecies() {
    try {
        const speciesCount = await BirdBoardAPI.getSpeciesStatistics();
        const categoryItems = document.querySelectorAll('.category__item');
        
        const speciesMap = {
            'Хвилястий папуга': 'Хвилястий папуга',
            'Корела': 'Корела',
            'Нерозлучник': 'Нерозлучник',
            'Жако': 'Жако',
            'Ара': 'Ара',
            'Амазон': 'Амазон',
            'Какаду': 'Какаду',
            'Какарікі': 'Какарікі'
        };
        
        categoryItems.forEach(item => {
            const titleElement = item.querySelector('h4');
            if (titleElement) {
                const speciesName = titleElement.textContent.trim();
                const mappedSpecies = speciesMap[speciesName];
                
                if (mappedSpecies) {
                    const count = speciesCount[mappedSpecies] || 0;
                    const ending = getAdsEnding(count);
                    
                    const countElement = item.querySelector('p');
                    if (countElement) {
                        countElement.textContent = `${count} ${ending}`;
                    }
                }
            }
        });
    } catch (error) {
        console.error('Помилка оновлення статистики:', error);
    }
}

// Додайте цей код в кінець auth.js
if (typeof BirdBoardAPI === 'undefined') {
    const API_BASE_URL = 'http://localhost:3000/api';

    window.BirdBoardAPI = {
        async getAdvertisements() {
            try {
                const response = await fetch(`${API_BASE_URL}/advertisements`);
                if (!response.ok) throw new Error('Помилка отримання оголошень');
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                return JSON.parse(localStorage.getItem('advertisements')) || [];
            }
        },

        async getSpeciesStatistics() {
            try {
                const response = await fetch(`${API_BASE_URL}/statistics/species`);
                if (!response.ok) throw new Error('Помилка отримання статистики');
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                return {};
            }
        },

        async createAdvertisement(adData) {
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

                const response = await fetch(`${API_BASE_URL}/advertisements`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Помилка створення оголошення');
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        dataURLtoFile(dataURL, filename) {
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
    };
}


window.updatePopularSpecies = updatePopularSpecies;
window.countAdsBySpecies = countAdsBySpecies;
window.getAdsEnding = getAdsEnding;

// Додайте в кінець auth.js
if (typeof BirdBoardAPI === 'undefined') {
    // Автоматичне визначення API URL
    const getAPIBaseURL = () => {
        // Спробуємо використати поточний origin
        return window.location.origin + '/api';
    };

    window.BirdBoardAPI = {
        async getAdvertisements() {
            try {
                const response = await fetch('/api/advertisements');
                if (!response.ok) throw new Error('Помилка отримання оголошень');
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                return JSON.parse(localStorage.getItem('advertisements')) || [];
            }
        },

        async getSpeciesStatistics() {
            try {
                const response = await fetch('/api/statistics/species');
                if (!response.ok) throw new Error('Помилка отримання статистики');
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                const ads = JSON.parse(localStorage.getItem('advertisements')) || [];
                const speciesCount = {};
                ads.forEach(ad => {
                    if (ad.characteristics && ad.characteristics.species) {
                        const species = ad.characteristics.species;
                        speciesCount[species] = (speciesCount[species] || 0) + 1;
                    }
                });
                return speciesCount;
            }
        },

        async createAdvertisement(adData) {
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
        },

        dataURLtoFile(dataURL, filename) {
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
    };
}