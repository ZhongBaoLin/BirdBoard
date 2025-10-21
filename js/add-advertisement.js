console.log('add-advertisement.js завантажено');

// Масив для зберігання оголошень
let advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];

// Змінні для зберігання фотографій
let selectedImages = [];

// Детальна перевірка всіх елементів
function debugAllElements() {
    console.log('=== ДЕТАЛЬНА ПЕРЕВІРКА ЕЛЕМЕНТІВ ===');
    
    const elementsToCheck = [
        'uploadArea', 'imageUpload', 'imagePreview', 
        'adForm', 'previewBtn', 'adTitle', 'adDescription',
        'adPrice', 'adSpecies', 'adGender', 'adHealth', 'adTemper'
    ];
    
    elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? '✓ Знайдено' : '✗ НЕ ЗНАЙДЕНО');
    });
    
    console.log('Структура DOM:');
    console.log('body:', document.body);
    console.log('main:', document.querySelector('main'));
    console.log('.container:', document.querySelector('.container'));
    console.log('.add-ad-section:', document.querySelector('.add-ad-section'));
    console.log('form:', document.querySelector('form'));
    console.log('form#adForm:', document.getElementById('adForm'));
    console.log('================================');
}

// Альтернативна ініціалізація
function initializeWithFallback() {
    console.log('=== АЛЬТЕРНАТИВНА ІНІЦІАЛІЗАЦІЯ ===');
    
    // Знаходимо елементи будь-яким способом
    const form = document.getElementById('adForm') || document.querySelector('form');
    const uploadArea = document.getElementById('uploadArea') || document.querySelector('.upload-area');
    const fileInput = document.getElementById('imageUpload') || document.querySelector('input[type="file"]');
    
    console.log('Знайдені елементи:', {
        form: form ? `✓ ${form.tagName} ${form.id || form.className}` : '✗ Не знайдено',
        uploadArea: uploadArea ? '✓ Знайдено' : '✗ Не знайдено',
        fileInput: fileInput ? '✓ Знайдено' : '✗ Не знайдено'
    });
    
    if (form) {
        console.log('Ініціалізація форми...');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Форма відправлена!');
            publishAdvertisement();
        });
        
        // Знаходимо кнопку попереднього перегляду
        const previewBtn = document.getElementById('previewBtn') || form.querySelector('button[type="button"]');
        if (previewBtn) {
            previewBtn.addEventListener('click', function() {
                showMessage('Функція попереднього перегляду буде доступна найближчим часом!', 'info');
            });
        }
    }
    
    if (uploadArea && fileInput) {
        console.log('Ініціалізація завантаження зображень...');
        initImageUploadManually(uploadArea, fileInput);
    }
    
    // Ініціалізація лічильника символів
    const textarea = document.getElementById('adDescription') || document.querySelector('textarea');
    const charCount = document.getElementById('charCount') || document.querySelector('.char-counter span');
    if (textarea && charCount) {
        initCharacterCountManually(textarea, charCount);
    }
}

// Ручна ініціалізація завантаження зображень
function initImageUploadManually(uploadArea, fileInput) {
    console.log('Ручна ініціалізація завантаження зображень...');
    
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleImageSelection(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', function(e) {
        handleImageSelection(e.target.files);
    });
}

// Ручна ініціалізація лічильника символів
function initCharacterCountManually(textarea, charCount) {
    textarea.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 900) {
            charCount.style.color = '#f44336';
        } else if (count > 700) {
            charCount.style.color = '#ff9800';
        } else {
            charCount.style.color = '#666';
        }
    });
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM ЗАВАНТАЖЕНО ===');
    console.log('URL:', window.location.href);
    console.log('Шлях:', window.location.pathname);
    
    // Перевірка авторизації
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        console.log('Користувач не авторизований, перенаправляємо...');
        window.location.href = '../index.html';
        return;
    }

    console.log('Поточний користувач:', currentUser.username);
    
    // Детальна відладка
    debugAllElements();

    // Ініціалізація з перевіркою
    setTimeout(() => {
        console.log('=== ПОЧАТОК ІНІЦІАЛІЗАЦІЇ ===');
        
        // Спробуємо основну ініціалізацію
        const formExists = document.getElementById('adForm');
        const uploadAreaExists = document.getElementById('uploadArea');
        
        console.log('Перевірка перед ініціалізацією:', {
            form: formExists ? '✓ Знайдено' : '✗ Не знайдено',
            uploadArea: uploadAreaExists ? '✓ Знайдено' : '✗ Не знайдено'
        });
        
        if (formExists && uploadAreaExists) {
            console.log('Використовуємо основну ініціалізацію...');
            initImageUpload();
            initForm();
            initCharacterCount();
        } else {
            console.log('Використовуємо альтернативну ініціалізацію...');
            initializeWithFallback();
        }
        
        updateHeader(currentUser);
        console.log('=== ІНІЦІАЛІЗАЦІЯ ЗАВЕРШЕНА ===');
    }, 300);
});

// Ініціалізація завантаження зображень
function initImageUpload() {
    console.log('initImageUpload: початок');
    
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageUpload');

    if (!uploadArea || !fileInput) {
        console.error('initImageUpload: елементи не знайдені');
        return;
    }

    console.log('initImageUpload: елементи знайдені, додаємо обробники');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleImageSelection(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleImageSelection(e.target.files));
    
    console.log('initImageUpload: завершено успішно');
}

// Ініціалізація форми
function initForm() {
    console.log('initForm: початок');
    
    const form = document.getElementById('adForm');
    if (!form) {
        console.error('initForm: форма не знайдена');
        return;
    }

    console.log('initForm: форма знайдена, додаємо обробники');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('initForm: форма відправлена');
        publishAdvertisement();
    });

    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            showMessage('Функція попереднього перегляду буде доступна найближчим часом!', 'info');
        });
    }
    
    console.log('initForm: завершено успішно');
}

// Обробка вибраних зображень
function handleImageSelection(files) {
    console.log('handleImageSelection викликано з файлами:', files);
    
    if (!files || files.length === 0) {
        console.log('Немає файлів');
        return;
    }

    if (selectedImages.length + files.length > 5) {
        showMessage('Можна завантажити не більше 5 фотографій', 'error');
        return;
    }

    console.log('Обробка файлів...');
    
    for (let file of files) {
        console.log('Обробка файлу:', file.name, file.type, file.size);
        
        if (!file.type.match('image.*')) {
            showMessage('Будь ласка, вибирайте тільки зображення', 'error');
            continue;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage(`Файл "${file.name}" занадто великий (макс. 5MB)`, 'error');
            continue;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('Файл прочитано:', file.name);
            selectedImages.push({
                name: file.name,
                data: e.target.result
            });
            updateImagePreview();
        };
        reader.onerror = function(error) {
            console.error('Помилка читання файлу:', error);
            showMessage(`Помилка при читанні файлу "${file.name}"`, 'error');
        };
        reader.readAsDataURL(file);
    }
}

// Оновлення прев'ю зображень
function updateImagePreview() {
    const imagePreview = document.getElementById('imagePreview');
    if (!imagePreview) return;

    imagePreview.innerHTML = '';

    selectedImages.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${image.data}" alt="Preview ${index + 1}">
            <button type="button" class="remove-image" onclick="removeImage(${index})" title="Видалити">×</button>
        `;
        imagePreview.appendChild(imageItem);
    });

    // Оновлення тексту в області завантаження
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        if (placeholder) {
            if (selectedImages.length > 0) {
                const remaining = 5 - selectedImages.length;
                placeholder.innerHTML = `<span>+</span><p>Додати ще фото (${remaining} залишилось)</p>`;
            } else {
                placeholder.innerHTML = `<span>+</span><p>Перетягніть фото сюди або натисніть для вибору</p>`;
            }
        }
    }
}

// Видалення зображення
function removeImage(index) {
    if (index >= 0 && index < selectedImages.length) {
        selectedImages.splice(index, 1);
        updateImagePreview();
    }
}

// Лічильник символів для опису
function initCharacterCount() {
    const textarea = document.getElementById('adDescription');
    const charCount = document.getElementById('charCount');

    if (!textarea || !charCount) return;

    textarea.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 900) {
            charCount.style.color = '#f44336';
        } else if (count > 700) {
            charCount.style.color = '#ff9800';
        } else {
            charCount.style.color = '#666';
        }
    });
}

// Публікація оголошення
function publishAdvertisement() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

    const form = document.getElementById('adForm');
    if (!form) return;

    // Отримуємо значення з форми
    const title = document.getElementById('adTitle')?.value;
    const description = document.getElementById('adDescription')?.value;
    const price = document.getElementById('adPrice')?.value;
    const gender = document.getElementById('adGender')?.value;
    const health = document.getElementById('adHealth')?.value;
    const temper = document.getElementById('adTemper')?.value;
    const species = document.getElementById('adSpecies')?.value;

    // Валідація обов'язкових полів
    if (!title || !description || !price || !species) {
        showMessage('Будь ласка, заповніть всі обов\'язкові поля', 'error');
        return;
    }

    if (selectedImages.length === 0) {
        showMessage('Будь ласка, додайте хоча б одне фото', 'error');
        return;
    }

    // Створення об'єкта оголошення
    const advertisement = {
        id: generateId(),
        title: title,
        description: description,
        price: parseInt(price),
        images: selectedImages,
        characteristics: {
            gender: gender,
            health: health,
            temper: temper,
            species: species
        },
        author: {
            username: currentUser.username,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            phone: currentUser.phone,
            email: currentUser.email,
            avatar: currentUser.avatar
        },
        date: new Date().toISOString(),
        views: 0
    };

    // Збереження оголошення
    advertisements.unshift(advertisement);
    localStorage.setItem('advertisements', JSON.stringify(advertisements));

    showMessage('Оголошення успішно опубліковано!', 'success');
    
    // Перенаправлення на головну сторінку через 2 секунди
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 2000);
}

// Генерація унікального ID
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Показ повідомлень
function showMessage(message, type = 'info') {
    console.log('showMessage called:', message, type);
    
    // Видаляємо існуючі повідомлення
    const existingMessage = document.querySelector('.ad-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ad-message ad-message-${type}`;
    messageDiv.textContent = message;
    
    // Додаємо базові стилі
    messageDiv.style.cssText = `
        padding: 15px 20px;
        margin: 20px 0;
        border-radius: 10px;
        font-weight: 600;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
    `;
    
    // Стилі для різних типів повідомлень
    if (type === 'success') {
        messageDiv.style.background = 'rgba(76, 175, 80, 0.1)';
        messageDiv.style.color = '#2e7d32';
        messageDiv.style.border = '1px solid #4caf50';
    } else if (type === 'error') {
        messageDiv.style.background = 'rgba(244, 67, 54, 0.1)';
        messageDiv.style.color = '#c62828';
        messageDiv.style.border = '1px solid #f44336';
    } else {
        messageDiv.style.background = 'rgba(33, 150, 243, 0.1)';
        messageDiv.style.color = '#1565c0';
        messageDiv.style.border = '1px solid #2196f3';
    }
    
    // Знаходимо контейнер для вставки
    const form = document.getElementById('adForm');
    console.log('Form found:', !!form);
    
    if (form) {
        // Вставляємо повідомлення перед формою
        form.parentNode.insertBefore(messageDiv, form);
        console.log('Message inserted before form');
    } else {
        // Якщо форма не знайдена, вставляємо в початок body
        document.body.insertBefore(messageDiv, document.body.firstChild);
        console.log('Message inserted at body start');
    }
    
    // Автоматично видаляємо повідомлення через 3 секунди (крім success)
    if (type !== 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
    
    return messageDiv;
}

// Оновлення хедера
function updateHeader(currentUser) {
    const accountBtn = document.querySelector('.header__account a');
    if (accountBtn && currentUser) {
        let avatarHTML = '';
        
        if (currentUser.avatar) {
            avatarHTML = `<img src="${currentUser.avatar}" alt="Аватар" class="user-avatar-img">`;
        } else {
            const firstLetter = currentUser.username.charAt(0).toUpperCase();
            avatarHTML = `<div class="user-avatar">${firstLetter}</div>`;
        }
        
        accountBtn.innerHTML = `
            ${avatarHTML}
            ${currentUser.username}
        `;
        
        // Додаємо випадаюче меню
        addDropdownMenu(currentUser);
    }
}

// Додавання випадаючого меню
function addDropdownMenu(currentUser) {
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
    `;
    
    accountBtn.style.position = 'relative';
    accountBtn.appendChild(dropdown);
    
    // Обробник кліку для відкриття/закриття меню
    accountBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
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

// Функція для оновлення кількості оголошень
function updateAdsCount() {
    const adsCountElement = document.getElementById('adsCount');
    if (adsCountElement) {
        const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
        adsCountElement.textContent = `(${advertisements.length})`;
    }
}

// Функція для відображення оголошень на головній сторінці
function displayAdvertisements() {
    const grid = document.getElementById('advertisementsGrid');
    if (!grid) return;

    const advertisements = JSON.parse(localStorage.getItem('advertisements')) || [];
    
    if (advertisements.length === 0) {
        grid.innerHTML = '<p class="no-ads">Поки що немає оголошень</p>';
        return;
    }

    grid.innerHTML = advertisements.map(ad => `
        <div class="advertisement-card">
            <div class="ad-image">
                ${ad.images && ad.images.length > 0 ? 
                    `<img src="${ad.images[0].data}" alt="${ad.title}">` : 
                    `<div class="no-image">Немає фото</div>`
                }
            </div>
            <div class="ad-content">
                <h4>${ad.title}</h4>
                <p class="ad-price">${ad.price} грн</p>
                <p class="ad-description">${ad.description.substring(0, 100)}...</p>
                <div class="ad-meta">
                    <span class="ad-date">${new Date(ad.date).toLocaleDateString()}</span>
                    <span class="ad-views">${ad.views} переглядів</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Додайте цю функцію для тестування стилів
function testHoverStyles() {
    console.log('Testing hover styles...');
    const cards = document.querySelectorAll('.advertisement-card');
    console.log('Found cards:', cards.length);
    
    cards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            console.log(`Hover on card ${index}`);
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            console.log(`Hover left card ${index}`);
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
        });
    });
}

// Викличте після відображення оголошень
setTimeout(testHoverStyles, 1000);