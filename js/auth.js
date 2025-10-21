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
    // Перевірка чи логін вже існує
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
        showError('Цей логін вже зайнятий');
        return false;
    }

    // Додавання нового користувача
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

// Функція для виходу
function logout() {
    currentUser = null;
    saveData();
    updateHeader();
    
    // Якщо ми на сторінці профілю, перенаправляємо на головну
    if (window.location.pathname.includes('profile.html')) {
        window.location.href = '../index.html';
    } else {
        // Інакше просто оновлюємо хедер
        window.location.reload();
    }
}

// Функція для оновлення хедера
function updateHeader() {
    const accountBtn = document.querySelector('.header__account a');
    if (accountBtn) {
        if (currentUser) {
            const firstLetter = currentUser.username.charAt(0).toUpperCase();
            accountBtn.innerHTML = `
                <div class="user-avatar">${firstLetter}</div>
                ${currentUser.username}
            `;
            
            // Додаємо випадаюче меню
            addDropdownMenu();
        } else {
            // Повертаємо початковий стан для незалогінених користувачів
            accountBtn.innerHTML = `
                <img src="./icons/Аккаунт чорний.svg" alt="">
                Ваш профіль
            `;
            accountBtn.href = "./pages/auth.html";
            
            // Видаляємо випадаюче меню
            const dropdown = accountBtn.parentNode.querySelector('.dropdown-menu');
            if (dropdown) {
                dropdown.remove();
            }
        }
    }
}

// Додавання випадаючого меню
function addDropdownMenu() {
    const accountBtn = document.querySelector('.header__account');
    if (!accountBtn || !currentUser) return;
    
    // Видаляємо існуюче меню
    const existingDropdown = accountBtn.querySelector('.dropdown-menu');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    dropdown.innerHTML = `
        <button onclick="window.location.href='./pages/profile.html'">Мій профіль</button>
        <button onclick="logout()">Вийти з аккаунту</button>
    `; // ВИДАЛИТИ КНОПКУ "Додати оголошення"
    
    accountBtn.style.position = 'relative';
    accountBtn.appendChild(dropdown);
    
    // Обробник кліку для відкриття/закриття меню
    accountBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Запобігаємо закриттю при кліку на сам елемент
        dropdown.classList.toggle('show');
    });
    
    // Закриваємо меню при кліку поза ним
    document.addEventListener('click', function(e) {
        if (!accountBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    // Запобігаємо закриттю при кліку всередині меню
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
    
    let isLoginMode = window.location.pathname.includes('auth.html') ? false : true;

    // Функція для перемикання між режимами
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
        
        // Повторно додаємо обробник події для нової посилання
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

    // Додаємо обробник для початкового посилання
    if (switchLink) {
        switchLink.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAuthMode();
        });
    }

    // Обробка відправки форми
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (isLoginMode) {
            // Вхід
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (login(username, password)) {
                window.location.href = '../index.html';
            } else {
                showError('Невірний логін або пароль');
            }
        } else {
            // Реєстрація
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

    // Якщо ми на сторінці auth.html, показуємо форму реєстрації за замовчуванням
    if (window.location.pathname.includes('auth.html') && !isLoginMode) {
        // Вже в режимі реєстрації, нічого не робимо
    }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    updateHeader();
    initAuthModal();
    
    // Якщо користувач вже залогінений і намагається перейти на сторінку авторизації
    if (window.location.pathname.includes('auth.html') && currentUser) {
        window.location.href = '../index.html';
    }
});

// Функція для завантаження аватарки
function uploadAvatar(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarData = e.target.result;
            
            // Оновлюємо аватарку поточного користувача
            if (currentUser) {
                currentUser.avatar = avatarData;
                
                // Оновлюємо в масиві користувачів
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

// Функція для видалення аватарки
function removeAvatar() {
    if (currentUser) {
        currentUser.avatar = null;
        
        // Оновлюємо в масиві користувачів
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].avatar = null;
            saveData();
            updateHeader();
        }
    }
}

// Оновлюємо функцію updateHeader для підтримки аватарки
function updateHeader() {
    const accountBtn = document.querySelector('.header__account a');
    if (accountBtn) {
        if (currentUser) {
            let avatarHTML = '';
            
            if (currentUser.avatar) {
                // Використовуємо завантажену аватарку
                avatarHTML = `<img src="${currentUser.avatar}" alt="Аватар" class="user-avatar-img">`;
            } else {
                // Використовуємо букву як запасний варіант
                const firstLetter = currentUser.username.charAt(0).toUpperCase();
                avatarHTML = `<div class="user-avatar">${firstLetter}</div>`;
            }
            
            accountBtn.innerHTML = `
                ${avatarHTML}
                ${currentUser.username}
            `;
            
            // Додаємо випадаюче меню
            addDropdownMenu();
        } else {
            // Повертаємо початковий стан для незалогінених користувачів
            accountBtn.innerHTML = `
                <img src="./icons/Аккаунт чорний.svg" alt="">
                Ваш профіль
            `;
            accountBtn.href = "./pages/auth.html";
            
            // Видаляємо випадаюче меню
            const dropdown = accountBtn.parentNode.querySelector('.dropdown-menu');
            if (dropdown) {
                dropdown.remove();
            }
        }
    }
}

// Функція для перевірки авторизації при додаванні оголошення
function checkAuthForAd() {
    if (!currentUser) {
        showAuthModal();
        return false;
    }
    window.location.href = './pages/add-advertisement.html';
    return true;
}

// Показ модального вікна
function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Закриття модального вікна
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Ініціалізація модального вікна
function initAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeAuthModal);
        }
        
        // Закриття при кліку поза модальним вікном
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAuthModal();
            }
        });
    }
}

// Додаємо обробник для кнопки "Додати оголошення" після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    
    // Додаємо обробник для кнопки "Додати оголошення"
    const addAdBtn = document.querySelector('.header__btn a');
    if (addAdBtn) {
        addAdBtn.addEventListener('click', function(e) {
            e.preventDefault();
            checkAuthForAd();
        });
    }
});

// Функція для відображення оголошень на головній сторінці
function displayAdvertisements() {
    const advertisementsGrid = document.getElementById('advertisementsGrid');
    if (!advertisementsGrid) return;

    const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
    
    console.log('Оголошення для відображення:', advertisements);

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
}

function createAdElement(advertisement) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isOwner = currentUser && currentUser.username === advertisement.author.username;
    
    const adDiv = document.createElement('div');
    adDiv.className = 'advertisement-card';
    adDiv.setAttribute('data-ad-id', advertisement.id);
    
    // Додаємо обробник кліку
    adDiv.addEventListener('click', function(e) {
        // Перевіряємо, чи клік не був на кнопці видалення
        if (!e.target.closest('.delete-ad-btn')) {
            console.log('Клік по картці, ID:', advertisement.id);
            goToAdvertisement(advertisement.id);
        }
    });
    
    // Отримуємо перше зображення (якщо є)
    const firstImage = advertisement.images && advertisement.images.length > 0 
        ? advertisement.images[0].data 
        : '../images/placeholder-bird.jpg';
    
    // Обрізаємо опис, якщо він занадто довгий
    const shortDescription = advertisement.description.length > 100 
        ? advertisement.description.substring(0, 100) + '...' 
        : advertisement.description;

    adDiv.innerHTML = `
        <div class="ad-image">
            <img src="${firstImage}" alt="${advertisement.title}" onerror="this.src='../images/placeholder-bird.jpg'">
            ${isOwner ? '<button class="delete-ad-btn" onclick="event.stopPropagation(); confirmDeleteAd(\'' + advertisement.id + '\')">×</button>' : ''}
        </div>
        <div class="ad-content">
            <h4 class="ad-title">${advertisement.title}</h4>
            <p class="ad-price">${advertisement.price} грн</p>
            <p class="ad-description">${shortDescription}</p>
            <div class="ad-meta">
                <span class="ad-species">${advertisement.characteristics.species}</span>
                <span class="ad-date">${formatDate(advertisement.date)}</span>
            </div>
        </div>
    `;

    return adDiv;
}

// Функція для переходу на сторінку оголошення
function goToAdvertisement(adId) {
    console.log('Перехід на оголошення:', adId);
    window.location.href = `./pages/advertisement.html?id=${adId}`;
}

// Підтвердження видалення оголошення
function confirmDeleteAd(adId) {
    const modal = document.getElementById('deleteAdModal') || createDeleteModal();
    modal.style.display = 'flex';
    
    // Зберігаємо ID оголошення для видалення
    modal.setAttribute('data-ad-id', adId);
}

// Створення модального вікна для видалення
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
    
    // Додаємо обробники для закриття
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

// Видалення оголошення
function deleteAd() {
    const modal = document.getElementById('deleteAdModal');
    const adId = modal.getAttribute('data-ad-id');
    
    if (!adId) return;
    
    const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Знаходимо оголошення
    const adIndex = advertisements.findIndex(ad => ad.id === adId);
    
    if (adIndex === -1) {
        alert('Оголошення не знайдено');
        return;
    }
    
    const advertisement = advertisements[adIndex];
    
    // Перевіряємо, чи належить оголошення поточному користувачу
    if (!currentUser || currentUser.username !== advertisement.author.username) {
        alert('У вас немає прав для видалення цього оголошення');
        return;
    }
    
    // Видаляємо оголошення
    advertisements.splice(adIndex, 1);
    localStorage.setItem('advertisements', JSON.stringify(advertisements));
    
    // Закриваємо модальне вікно
    modal.style.display = 'none';
    
    // Оновлюємо відображення оголошень
    displayAdvertisements();
    updateAdsCount();
    
    // Показуємо повідомлення про успішне видалення
    showMessage('Оголошення успішно видалено', 'success');
}

// Форматування дати для відображення
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Сьогодні';
    } else if (diffDays === 2) {
        return 'Вчора';
    } else if (diffDays <= 7) {
        return `${diffDays} днів тому`;
    } else {
        return date.toLocaleDateString('uk-UA');
    }
}

// Додайте цей виклик до DOMContentLoaded в auth.js
document.addEventListener('DOMContentLoaded', function() {
    updateHeader();
    initAuthModal();
    displayAdvertisements(); // Додаємо цей виклик!
    
    // Якщо користувач вже залогінений і намагається перейти на сторінку авторизації
    if (window.location.pathname.includes('auth.html') && currentUser) {
        window.location.href = '../index.html';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Оновлюємо кількість оголошень
    updateAdsCount();
    
    // Відображаємо оголошення
    displayAdvertisements();
    
    // Інші ініціалізації...
    checkAuthStatus();
});

// Функція для перевірки статусу авторизації
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

    // Функція для показу повідомлень (для auth.js)
function showMessage(message, type = 'info') {
    // Створюємо або знаходимо контейнер для повідомлень
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
    
    // Видаляємо існуючі повідомлення
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
    
    // Автоматично видаляємо повідомлення через 3 секунди
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Функція для переходу на сторінку оголошення
function goToAdvertisement(adId) {
    console.log('Перехід на оголошення з ID:', adId);
    if (adId) {
        window.location.href = `./pages/advertisement.html?id=${encodeURIComponent(adId)}`;
    } else {
        console.error('ID оголошення не визначено');
    }
}

// Додаємо обробники кліку для всіх карток оголошень
function setupAdvertisementClickHandlers() {
    const adCards = document.querySelectorAll('.advertisement-card');
    console.log('Знайдено карток:', adCards.length);
    
    adCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Перевіряємо, чи клік не був на кнопці видалення
            if (!e.target.closest('.delete-ad-btn')) {
                const adId = this.getAttribute('data-ad-id');
                console.log('Клік по картці з ID:', adId);
                goToAdvertisement(adId);
            }
        });
        
        // Додаємо стиль курсора для інтерактивності
        card.style.cursor = 'pointer';
    });
}

// Викликаємо після відображення оголошень
document.addEventListener('DOMContentLoaded', function() {
    // ... інший код ініціалізації ...
    
    // Додаємо обробники кліку після відображення оголошень
    setTimeout(() => {
        setupAdvertisementClickHandlers();
    }, 100);
});

// Також оновлюємо функцію displayAdvertisements
function displayAdvertisements() {
    const advertisementsGrid = document.getElementById('advertisementsGrid');
    if (!advertisementsGrid) return;

    const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
    
    console.log('Оголошення для відображення:', advertisements);

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
    
    // Додаємо обробники кліку після створення карток
    setupAdvertisementClickHandlers();
}

// Тестова функція для перевірки переходу
function testAdvertisementNavigation() {
    const ads = JSON.parse(localStorage.getItem('advertisements')) || [];
    if (ads.length > 0) {
        const testAd = ads[0];
        console.log('Тестуємо перехід на оголошення:', testAd.id);
        goToAdvertisement(testAd.id);
    } else {
        console.log('Немає оголошень для тесту');
    }
}