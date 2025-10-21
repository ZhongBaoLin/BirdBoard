// Отримуємо поточного користувача
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const users = JSON.parse(localStorage.getItem('users')) || [];

if (!currentUser) {
    window.location.href = '../index.html';
}

// Функції для аватарки
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
        
        // Оновлюємо в масиві користувачів
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
}

function updateHeader() {
    // Оновлюємо хедер на головній сторінці, якщо вона відкрита
    if (window.opener && typeof window.opener.updateHeader === 'function') {
        window.opener.updateHeader();
    }
}

// Оновлення аватарки в профілі
function updateProfileAvatar() {
    const avatarContainer = document.getElementById('avatarContainer');
    if (!avatarContainer) return;

    if (currentUser.avatar) {
        avatarContainer.innerHTML = `
            <div class="avatar-preview">
                <img src="${currentUser.avatar}" alt="Ваша аватарка" class="avatar-image">
                <button type="button" onclick="removeAvatarProfile()" class="remove-avatar-btn">×</button>
            </div>
        `;
    } else {
        const firstLetter = currentUser.username.charAt(0).toUpperCase();
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
    
    // Перевірка типу файлу
    if (!file.type.match('image.*')) {
        showMessage('Будь ласка, виберіть зображення (JPEG, PNG, GIF)', 'error');
        return;
    }
    
    // Перевірка розміру файлу (макс. 5MB)
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
    
    // Очищаємо input для можливості вибрати той самий файл знову
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
    // Видаляємо існуючі повідомлення
    const existingMessage = document.querySelector('.profile-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `profile-message profile-message-${type}`;
    messageDiv.textContent = message;
    
    const profileSection = document.querySelector('.profile-section');
    profileSection.insertBefore(messageDiv, profileSection.firstChild);
    
    // Автоматично видаляємо повідомлення через 3 секунди
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Заповнюємо дані профілю
function loadProfileData() {
    document.getElementById('profileName').textContent = currentUser.firstName;
    document.getElementById('profileSurname').textContent = currentUser.lastName;
    document.getElementById('profilePatronymic').textContent = currentUser.middleName;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileLogin').textContent = currentUser.username;
    
    // Оновлюємо аватарку
    updateProfileAvatar();
}

// Режим редагування
function enableEditMode() {
    const fields = [
        { id: 'profileName', key: 'firstName', placeholder: "Ім'я" },
        { id: 'profileSurname', key: 'lastName', placeholder: "Прізвище" },
        { id: 'profilePatronymic', key: 'middleName', placeholder: "По батькові" },
        { id: 'profilePhone', key: 'phone', placeholder: "Телефон" },
        { id: 'profileEmail', key: 'email', placeholder: "Email" }
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        const currentValue = currentUser[field.key];
        
        element.innerHTML = `<input type="text" id="edit${field.key}" value="${currentValue}" placeholder="${field.placeholder}" class="edit-input">`;
    });
    
    // Додаємо поле для пароля
    const loginRow = document.getElementById('profileLogin').parentNode;
    const passwordRow = document.createElement('p');
    passwordRow.innerHTML = `
        <span class="label">Пароль:</span>
        <span class="value">
            <input type="password" id="editPassword" value="${currentUser.password}" class="edit-input">
            <span class="toggle-password" onclick="togglePasswordVisibility()">👁️</span>
        </span>
    `;
    loginRow.parentNode.insertBefore(passwordRow, loginRow.nextSibling);
    
    document.getElementById('editProfileBtn').style.display = 'none';
    document.getElementById('saveProfileBtn').style.display = 'inline-block';
    document.getElementById('avatarUpload').style.display = 'none';
}

// Збереження змін
function saveProfileChanges() {
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex !== -1) {
        // Отримуємо значення з полів вводу
        const updatedUser = {
            ...users[userIndex],
            lastName: document.getElementById('editlastName').value,
            firstName: document.getElementById('editfirstName').value,
            middleName: document.getElementById('editmiddleName').value,
            phone: document.getElementById('editphone').value,
            email: document.getElementById('editemail').value,
            password: document.getElementById('editPassword').value
        };
        
        // Валідація email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updatedUser.email)) {
            showMessage('Будь ласка, введіть коректний email', 'error');
            return;
        }
        
        // Валідація телефону (базовий формат)
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!phoneRegex.test(updatedUser.phone)) {
            showMessage('Будь ласка, введіть коректний номер телефону', 'error');
            return;
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
    }
}

// Вихід з режиму редагування
function disableEditMode() {
    const fields = ['profileName', 'profileSurname', 'profilePatronymic', 'profilePhone', 'profileEmail', 'profileLogin'];
    
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        const fieldKey = fieldId.replace('profile', '').charAt(0).toLowerCase() + fieldId.replace('profile', '').slice(1);
        if (currentUser[fieldKey]) {
            element.textContent = currentUser[fieldKey];
        }
    });
    
    // Видаляємо рядок з паролем
    const passwordRow = document.querySelector('p:has(#editPassword)');
    if (passwordRow) {
        passwordRow.remove();
    }
    
    document.getElementById('editProfileBtn').style.display = 'inline-block';
    document.getElementById('saveProfileBtn').style.display = 'none';
    document.getElementById('avatarUpload').style.display = 'inline-block';
}

// Перемикання видимості пароля
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('editPassword');
    const toggleBtn = document.querySelector('.toggle-password');
    
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

// Вихід з акаунту
function logout() {
    if (confirm('Ви впевнені, що хочете вийти з акаунту?')) {
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }
}

// Додаємо обробник для кліку на аватарку (для завантаження)
function setupAvatarClick() {
    const avatarContainer = document.getElementById('avatarContainer');
    if (avatarContainer) {
        avatarContainer.addEventListener('click', function() {
            document.getElementById('avatarUpload').click();
        });
        
        // Додаємо курсор-пойнтер для інтерактивності
        avatarContainer.style.cursor = 'pointer';
        avatarContainer.title = 'Натисніть для зміни аватарки';
    }
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    
    // Додаємо обробники подій
    document.getElementById('editProfileBtn').addEventListener('click', enableEditMode);
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfileChanges);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('avatarUpload').addEventListener('change', handleAvatarUpload);
    
    // Налаштовуємо клік на аватарку
    setupAvatarClick();
    
    // Додаємо обробник для відображення підказки при наведенні на аватарку
    const avatarUpload = document.getElementById('avatarUpload');
    const uploadLabel = document.querySelector('.upload-btn');
    
    if (uploadLabel) {
        uploadLabel.addEventListener('click', function(e) {
            e.preventDefault();
            avatarUpload.click();
        });
    }
});

// Додаємо стилі для повідомлень (динамічно)
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