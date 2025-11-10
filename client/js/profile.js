// Profile.js - Виправлена версія
(function() {
    'use strict';
    
    console.log('=== ІНІЦІАЛІЗАЦІЯ PROFILE.JS ===');
    
    // Отримуємо поточного користувача
    let currentUser = null;
    let users = [];
    
    // Ініціалізація даних
    function initData() {
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
            users = JSON.parse(localStorage.getItem('users')) || [];
            
            console.log('Поточний користувач:', currentUser);
            console.log('Всі користувачі:', users);
            
            if (!currentUser) {
                console.log('❌ Користувач не авторизований, перенаправляємо...');
                window.location.href = '../index.html';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Помилка ініціалізації даних:', error);
            return false;
        }
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
                        updateProfileAvatar();
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
                updateProfileAvatar();
                updateHeader();
            }
        }
    }
    
    function saveData() {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('✅ Дані збережено');
    }
    
    function updateHeader() {
        if (window.opener && typeof window.opener.updateHeader === 'function') {
            window.opener.updateHeader();
        }
    }
    
    // Оновлення аватарки в профілі
    function updateProfileAvatar() {
        const avatarContainer = document.getElementById('avatarContainer');
        if (!avatarContainer) {
            console.log('❌ avatarContainer не знайдено');
            return;
        }
    
        console.log('Оновлення аватарки:', currentUser.avatar);
    
        if (currentUser.avatar) {
            avatarContainer.innerHTML = `
                <div class="avatar-preview">
                    <img src="${currentUser.avatar}" alt="Ваша аватарка" class="avatar-image">
                    <button type="button" class="remove-avatar-btn">×</button>
                </div>
            `;
            
            // Додаємо обробник для кнопки видалення
            const removeBtn = avatarContainer.querySelector('.remove-avatar-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', removeAvatarProfile);
            }
        } else {
            const firstLetter = (currentUser.username || 'U').charAt(0).toUpperCase();
            avatarContainer.innerHTML = `
                <div class="avatar-placeholder">
                    ${firstLetter}
                </div>
            `;
        }
    }
    
    // Обробка завантаження аватарки
    function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showMessage('Будь ласка, виберіть зображення (JPEG, PNG, GIF)', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Розмір файлу не повинен перевищувати 5MB', 'error');
            return;
        }
        
        uploadAvatar(file).then(() => {
            showMessage('Аватарку успішно оновлено!', 'success');
        }).catch(error => {
            console.error('Помилка завантаження аватарки:', error);
            showMessage('Помилка завантаження аватарки', 'error');
        });
        
        event.target.value = '';
    }
    
    // Видалення аватарки з профілю
    function removeAvatarProfile() {
        if (confirm('Ви впевнені, що хочете видалити аватарку?')) {
            removeAvatar();
            showMessage('Аватарку видалено', 'success');
        }
    }
    
    // Функція для відображення повідомлень
    function showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.profile-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `profile-message profile-message-${type}`;
        messageDiv.textContent = message;
        
        const profileSection = document.querySelector('.profile-section');
        if (profileSection) {
            profileSection.insertBefore(messageDiv, profileSection.firstChild);
        }
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
    
    // Заповнюємо дані профілю - ВИПРАВЛЕНА ВЕРСІЯ
    function loadProfileData() {
        console.log('=== ЗАВАНТАЖЕННЯ ДАНИХ ПРОФІЛЮ ===');
        
        if (!currentUser) {
            console.log('❌ currentUser не визначено');
            return;
        }
        
        console.log('Дані для відображення:', currentUser);
        
        function setElementText(id, value, defaultValue = 'Не вказано') {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || defaultValue;
                console.log(`✅ Встановлено ${id}: "${value || defaultValue}"`);
            } else {
                console.log(`❌ Елемент ${id} не знайдено`);
            }
        }
        
        // Встановлюємо значення з перевірками
        setElementText('profileName', currentUser.firstName);
        setElementText('profileSurname', currentUser.lastName);
        setElementText('profilePatronymic', currentUser.middleName || currentUser.patronymic);
        setElementText('profilePhone', currentUser.phone);
        setElementText('profileEmail', currentUser.email);
        setElementText('profileLogin', currentUser.username);
        
        // Оновлюємо аватарку
        updateProfileAvatar();
        
        console.log('✅ Дані профілю завантажено');
    }
    
    // Додаємо глобальну функцію для оновлення профілю
    window.updateProfileData = function() {
        console.log('Викликано updateProfileData');
        loadProfileData();
    };
    
    // Режим редагування
    function enableEditMode() {
        console.log('Увімкнення режиму редагування...');
        
        const fields = [
            { id: 'profileName', key: 'firstName', placeholder: "Ім'я" },
            { id: 'profileSurname', key: 'lastName', placeholder: "Прізвище" },
            { id: 'profilePatronymic', key: 'middleName', placeholder: "По батькові" },
            { id: 'profilePhone', key: 'phone', placeholder: "Телефон" },
            { id: 'profileEmail', key: 'email', placeholder: "Email" }
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                const currentValue = currentUser[field.key] || '';
                element.innerHTML = `<input type="text" id="edit${field.key}" value="${currentValue}" placeholder="${field.placeholder}" class="edit-input">`;
            }
        });
        
        // Додаємо поле для пароля
        const loginRow = document.getElementById('profileLogin');
        if (loginRow) {
            const passwordRow = document.createElement('p');
            passwordRow.innerHTML = `
                <span class="label">Пароль:</span>
                <span class="value">
                    <input type="password" id="editPassword" value="${currentUser.password || ''}" class="edit-input">
                    <span class="toggle-password">👁️</span>
                </span>
            `;
            loginRow.parentNode.insertBefore(passwordRow, loginRow.nextSibling);
            
            // Додаємо обробник для перемикання видимості пароля
            const toggleBtn = passwordRow.querySelector('.toggle-password');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', togglePasswordVisibility);
            }
        }
        
        // Перемикаємо кнопки
        const editBtn = document.getElementById('editProfileBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const avatarUpload = document.getElementById('avatarUpload');
        
        if (editBtn) editBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (avatarUpload) avatarUpload.style.display = 'none';
    }
    
    // Збереження змін
    function saveProfileChanges() {
        console.log('Збереження змін профілю...');
        
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        
        if (userIndex !== -1) {
            const updatedUser = {
                ...users[userIndex],
                lastName: document.getElementById('editlastName')?.value || '',
                firstName: document.getElementById('editfirstName')?.value || '',
                middleName: document.getElementById('editmiddleName')?.value || '',
                phone: document.getElementById('editphone')?.value || '',
                email: document.getElementById('editemail')?.value || '',
                password: document.getElementById('editPassword')?.value || users[userIndex].password // Зберігаємо старий пароль, якщо новий не введено
            };
            
            console.log('Оновлені дані:', updatedUser);
            
            // Валідація email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (updatedUser.email && !emailRegex.test(updatedUser.email)) {
                showMessage('Будь ласка, введіть коректний email', 'error');
                return;
            }
            
            // Валідація телефону
            const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            if (updatedUser.phone && !phoneRegex.test(updatedUser.phone)) {
                showMessage('Будь ласка, введіть коректний номер телефону', 'error');
                return;
            }
            
            // Якщо пароль не змінювали, зберігаємо старий
            if (!updatedUser.password) {
                updatedUser.password = users[userIndex].password;
            }
            
            // Оновлюємо поточного користувача
            Object.assign(currentUser, updatedUser);
            
            // Зберігаємо зміни
            users[userIndex] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Повертаємося в режим перегляду
            disableEditMode();
            loadProfileData();
            updateHeader();
            
            showMessage('Дані успішно оновлено!', 'success');
        } else {
            showMessage('Помилка: користувача не знайдено', 'error');
        }
    }
    
    // Вихід з режиму редагування
    function disableEditMode() {
        console.log('Вимкнення режиму редагування...');
        
        loadProfileData();
        
        // Видаляємо рядок з паролем
        const passwordRow = document.querySelector('p:has(#editPassword)');
        if (passwordRow) {
            passwordRow.remove();
        }
        
        // Перемикаємо кнопки
        const editBtn = document.getElementById('editProfileBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const avatarUpload = document.getElementById('avatarUpload');
        
        if (editBtn) editBtn.style.display = 'inline-block';
        if (saveBtn) saveBtn.style.display = 'none';
        if (avatarUpload) avatarUpload.style.display = 'inline-block';
    }
    
    // Перемикання видимості пароля
    function togglePasswordVisibility() {
        const passwordInput = document.getElementById('editPassword');
        const toggleBtn = document.querySelector('.toggle-password');
        
        if (passwordInput && toggleBtn) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.textContent = '🔒';
                toggleBtn.title = 'Приховати пароль';
            } else {
                passwordInput.type = 'password';
                toggleBtn.textContent = '👁️';
                toggleBtn.title = 'Показати пароль';
            }
        }
    }
    
    // Вихід з акаунту
    function logout() {
        if (confirm('Ви впевнені, що хочете вийти з акаунту?')) {
            localStorage.removeItem('currentUser');
            window.location.href = '../index.html';
        }
    }
    
    // Додаємо обробник для кліку на аватарку
    function setupAvatarClick() {
        const avatarContainer = document.getElementById('avatarContainer');
        if (avatarContainer) {
            avatarContainer.addEventListener('click', function() {
                document.getElementById('avatarUpload').click();
            });
            
            avatarContainer.style.cursor = 'pointer';
            avatarContainer.title = 'Натисніть для зміни аватарки';
        }
    }
    
    // Ініціалізація
    function initProfile() {
        console.log('=== ІНІЦІАЛІЗАЦІЯ PROFILE ===');
        
        // Ініціалізуємо дані
        if (!initData()) {
            return;
        }
        
        // Перевіряємо наявність необхідних елементів
        const requiredElements = [
            'profileName', 'profileSurname', 'profilePatronymic', 
            'profilePhone', 'profileEmail', 'profileLogin',
            'editProfileBtn', 'saveProfileBtn', 'logoutBtn', 'avatarUpload'
        ];
        
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            console.log(`${id}:`, element ? '✓ Знайдено' : '✗ Не знайдено');
        });
        
        // Завантажуємо дані профілю
        loadProfileData();
        
        // Додаємо обробники подій
        const editBtn = document.getElementById('editProfileBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const avatarUpload = document.getElementById('avatarUpload');
        
        if (editBtn) {
            editBtn.addEventListener('click', enableEditMode);
            console.log('✅ Обробник додано для editProfileBtn');
        } else {
            console.log('❌ editProfileBtn не знайдено');
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', saveProfileChanges);
            console.log('✅ Обробник додано для saveProfileBtn');
        } else {
            console.log('❌ saveProfileBtn не знайдено');
        }
        
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        if (avatarUpload) avatarUpload.addEventListener('change', handleAvatarUpload);
        
        // Налаштовуємо клік на аватарку
        setupAvatarClick();
        
        console.log('✅ PROFILE.JS ІНІЦІАЛІЗОВАНО');
    }
    
    // Запускаємо ініціалізацію при завантаженні DOM
    document.addEventListener('DOMContentLoaded', function() {
        console.log('=== DOM ЗАВАНТАЖЕНО В PROFILE.JS ===');
        setTimeout(initProfile, 100);
    });
    
    // Додаємо стилі для повідомлень
    const messageStyles = `
        .profile-message {
            padding: 15px;
            margin: 20px 0;
            border-radius: 10px;
            font-weight: 600;
            text-align: center;
            animation: slideDown 0.3s ease;
        }
        
        .profile-message-success {
            background: rgba(76, 175, 80, 0.1);
            color: #2e7d32;
            border: 1px solid #4caf50;
        }
        
        .profile-message-error {
            background: rgba(244, 67, 54, 0.1);
            color: #c62828;
            border: 1px solid #f44336;
        }
        
        .profile-message-info {
            background: rgba(33, 150, 243, 0.1);
            color: #1565c0;
            border: 1px solid #2196f3;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    // Додаємо стилі в документ
    if (!document.querySelector('#profile-message-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'profile-message-styles';
        styleSheet.textContent = messageStyles;
        document.head.appendChild(styleSheet);
    }
    
    // Експортуємо функції в глобальну область видимості
    window.removeAvatarProfile = removeAvatarProfile;
    window.togglePasswordVisibility = togglePasswordVisibility;
    window.enableEditMode = enableEditMode;
    window.saveProfileChanges = saveProfileChanges;
    window.logout = logout;
    window.loadProfileData = loadProfileData; // Додаємо глобальний доступ
    
})();