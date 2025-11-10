// client/js/add-advertisement.js
console.log('add-advertisement.js завантажено');

// Масив для зберігання фотографій
let selectedImages = [];

// Функція для отримання поточного користувача з LocalStorage
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Детальна перевірка всіх елементів
function debugAllElements() {
    console.log('=== ДЕТАЛЬНА ПЕРЕВІРКА ЕЛЕМЕНТІВ ===');
    
    const elementsToCheck = [
        'uploadArea', 'imageUpload', 'imagePreview', 
        'adForm', 'adTitle', 'adDescription',
        'adPrice', 'adSpecies', 'adGender', 'adHealth', 'adTemper'
    ];
    
    elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? '✓ Знайдено' : '✗ НЕ ЗНАЙДЕНО');
    });
    console.log('================================');
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM ЗАВАНТАЖЕНО ===');
    
    // Перевірка, чи ми на сторінці додавання оголошення
    const isAddAdPage = window.location.pathname.includes('add-advertisement.html');
    const currentUser = getCurrentUser();
    
    if (isAddAdPage) {
        // Перевірка авторизації ТІЛЬКИ для сторінки додавання оголошення
        if (!currentUser) {
            console.log('Користувач не авторизований, перенаправляємо...');
            // Використовуйте шлях до index.html відносно pages/
            window.location.href = '../index.html'; 
            return;
        }
        console.log('Поточний користувач:', currentUser.username);
    }
    
    // Детальна відладка
    debugAllElements();

    // Запускаємо ініціалізацію
    setTimeout(() => {
        console.log('=== ПОЧАТОК ІНІЦІАЛІЗАЦІЇ ===');
        initImageUpload();
        initForm();
        initCharacterCount();
        
        // Оновлення хедера, якщо функція доступна
        if (typeof updateHeader === 'function') {
            updateHeader(currentUser);
        }
        console.log('=== ІНІЦІАЛІЗАЦІЯ ЗАВЕРШЕНА ===');
    }, 300);
});

// Ініціалізація завантаження зображень
function initImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageUpload');

    if (!uploadArea || !fileInput) return;

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
}

// Ініціалізація форми
function initForm() {
    const form = document.getElementById('adForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('initForm: форма відправлена');
        publishAdvertisement();
    });
}

// Обробка вибраних зображень
function handleImageSelection(files) {
    if (!files || files.length === 0) return;

    if (selectedImages.length + files.length > 5) {
        showMessage('Можна завантажити не більше 5 фотографій', 'error');
        return;
    }

    for (let file of files) {
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
            selectedImages.push({
                name: file.name,
                data: e.target.result // Зберігаємо як Base64 Data URL
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
            const remaining = 5 - selectedImages.length;
            if (selectedImages.length > 0) {
                placeholder.innerHTML = `<span>+</span><p>Додати ще фото (${remaining} залишилось)</p>`;
            } else {
                placeholder.innerHTML = `<span>+</span><p>Перетягніть фото сюди або натисніть для вибору</p>`;
            }
        }
    }
}

// Видалення зображення
window.removeImage = function(index) {
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

// Генерація унікального ID
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Публікація оголошення - ОСНОВНЕ ВИПРАВЛЕННЯ
async function publishAdvertisement() {
    console.log('=== ПУБЛІКАЦІЯ ОГОЛОШЕННЯ ===');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Ви не авторизовані. Перенаправляємо...', 'error');
        setTimeout(() => window.location.href = '../index.html', 1500);
        return;
    }

    // 1. Отримуємо значення з форми
    const title = document.getElementById('adTitle')?.value.trim();
    const description = document.getElementById('adDescription')?.value.trim();
    const price = document.getElementById('adPrice')?.value.trim();
    const location = document.getElementById('adLocation')?.value.trim();
    const gender = document.getElementById('adGender')?.value;
    const health = document.getElementById('adHealth')?.value;
    const temper = document.getElementById('adTemper')?.value;
    const species = document.getElementById('adSpecies')?.value;

    // 2. Валідація
    if (!title || !description || !price || !species || !location) {
        showMessage('Будь ласка, заповніть всі обов\'язкові поля', 'error');
        return;
    }
    if (selectedImages.length === 0) {
        showMessage('Будь ласка, додайте хоча б одне фото', 'error');
        return;
    }

    // 3. Створення об'єкта оголошення
    const advertisement = {
        id: generateId(),
        title: title,
        description: description,
        price: parseInt(price),
        location: location,
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

    console.log('Створено оголошення:', advertisement);

    try {
        showMessage('Публікація оголошення...', 'info');
        
        if (typeof BirdBoardAPI !== 'undefined' && BirdBoardAPI.createAdvertisement) {
            const newAd = await BirdBoardAPI.createAdvertisement(advertisement);
            console.log('Оголошення опубліковано на сервері:', newAd);
            showMessage('Оголошення успішно опубліковано!', 'success');
            
            // ДОДАТИ: Оновлення списку міст
            if (window.opener && typeof window.opener.updateCitySelect === 'function') {
                window.opener.updateCitySelect();
            }
        } else {
            // Fallback
            const localAds = JSON.parse(localStorage.getItem('advertisements')) || [];
            localAds.unshift(advertisement);
            localStorage.setItem('advertisements', JSON.stringify(localAds));
            showMessage('Оголошення успішно опубліковано! (LocalStorage Fallback)', 'success');
            
            // ДОДАТИ: Оновлення списку міст для fallback
            if (window.opener && typeof window.opener.updateCitySelect === 'function') {
                window.opener.updateCitySelect();
            }
        }
        
    } catch (error) {
        console.error('Помилка збереження:', error);
        
        if (error.name === 'QuotaExceededError') {
            showMessage('Недостатньо місця для збереження.', 'error');
        } else {
            showMessage('Помилка при публікації оголошення. Спробуйте ще раз.', 'error');
        }
    }
}

// Експортуємо функції для глобального доступу (для onclick та інших місць)
window.publishAdvertisement = publishAdvertisement;
window.removeImage = removeImage;