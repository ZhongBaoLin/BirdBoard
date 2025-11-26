console.log('edit-advertisement.js завантажено');

let currentAd = null;
let selectedImages = [];
let existingImages = [];

// Функція для отримання ID з URL
function getAdIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Завантаження даних оголошення
async function loadAdData(adId) {
    try {
        const adData = await BirdBoardAPI.getAdvertisementById(adId);
        
        if (!adData) {
            showMessage('Оголошення не знайдено', 'error');
            setTimeout(() => window.location.href = '../index.html', 2000);
            return;
        }

        // Перевірка прав власника
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.username !== adData.author.username) {
            showMessage('У вас немає прав для редагування цього оголошення', 'error');
            setTimeout(() => window.location.href = '../index.html', 2000);
            return;
        }

        currentAd = adData;
        existingImages = adData.images || [];
        displayAdData(adData);
        
    } catch (error) {
        console.error('Помилка завантаження оголошення:', error);
        showMessage('Помилка завантаження оголошення', 'error');
    }
}

// Відображення даних у формі
function displayAdData(adData) {
    // Заповнюємо поля форми
    document.getElementById('editAdTitle').value = adData.title || '';
    document.getElementById('editAdDescription').value = adData.description || '';
    document.getElementById('editAdPrice').value = adData.price || '';
    document.getElementById('editAdLocation').value = adData.location || '';
    
    // Заповнюємо характеристики
    document.getElementById('editAdSpecies').value = adData.characteristics?.species || '';
    document.getElementById('editAdGender').value = adData.characteristics?.gender || '';
    document.getElementById('editAdHealth').value = adData.characteristics?.health || '';
    document.getElementById('editAdTemper').value = adData.characteristics?.temper || '';
    
    // Відображаємо існуючі фото
    updateImagePreview();
    
    // Оновлюємо лічильник символів
    updateCharCount();
}

// Оновлення прев'ю зображень
function updateImagePreview() {
    const imagePreview = document.getElementById('editImagePreview');
    if (!imagePreview) return;

    imagePreview.innerHTML = '';

    // Відображаємо існуючі фото
    existingImages.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item existing-image';
        imageItem.innerHTML = `
            <img src="${getImagePath(image)}" alt="Existing ${index + 1}">
            <button type="button" class="remove-image" onclick="removeExistingImage(${index})" title="Видалити">×</button>
        `;
        imagePreview.appendChild(imageItem);
    });

    // Відображаємо нові фото
    selectedImages.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item new-image';
        imageItem.innerHTML = `
            <img src="${image.data}" alt="New ${index + 1}">
            <button type="button" class="remove-image" onclick="removeNewImage(${index})" title="Видалити">×</button>
        `;
        imagePreview.appendChild(imageItem);
    });

    // Оновлюємо текст в області завантаження
    const uploadArea = document.getElementById('editUploadArea');
    if (uploadArea) {
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        if (placeholder) {
            const totalImages = existingImages.length + selectedImages.length;
            const remaining = 5 - totalImages;
            
            if (totalImages > 0) {
                placeholder.innerHTML = `<span>+</span><p>Додати ще фото (${remaining} залишилось)</p>`;
            } else {
                placeholder.innerHTML = `<span>+</span><p>Перетягніть фото сюди або натисніть для вибору</p>`;
            }
        }
    }
}

// Видалення існуючого зображення
function removeExistingImage(index) {
    if (index >= 0 && index < existingImages.length) {
        existingImages.splice(index, 1);
        updateImagePreview();
    }
}

// Видалення нового зображення
function removeNewImage(index) {
    if (index >= 0 && index < selectedImages.length) {
        selectedImages.splice(index, 1);
        updateImagePreview();
    }
}

// Оновлення лічильника символів
function updateCharCount() {
    const textarea = document.getElementById('editAdDescription');
    const charCount = document.getElementById('editCharCount');
    
    if (textarea && charCount) {
        const count = textarea.value.length;
        charCount.textContent = count;
        
        if (count > 900) {
            charCount.style.color = '#f44336';
        } else if (count > 700) {
            charCount.style.color = '#ff9800';
        } else {
            charCount.style.color = '#666';
        }
    }
}

// Обробка вибраних зображень
function handleImageSelection(files) {
    if (!files || files.length === 0) return;

    const totalImages = existingImages.length + selectedImages.length + files.length;
    if (totalImages > 5) {
        showMessage('Можна завантажити не більше 5 фотографій всього', 'error');
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
                data: e.target.result
            });
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    }
}

// Ініціалізація завантаження зображень
function initImageUpload() {
    const uploadArea = document.getElementById('editUploadArea');
    const fileInput = document.getElementById('editImageUpload');

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

// Оновлення оголошення
async function updateAdvertisement(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

    // Отримуємо дані з форми
    const formData = {
        title: document.getElementById('editAdTitle')?.value,
        description: document.getElementById('editAdDescription')?.value,
        price: document.getElementById('editAdPrice')?.value,
        location: document.getElementById('editAdLocation')?.value,
        characteristics: {
            gender: document.getElementById('editAdGender')?.value,
            health: document.getElementById('editAdHealth')?.value,
            temper: document.getElementById('editAdTemper')?.value,
            species: document.getElementById('editAdSpecies')?.value
        },
        author: {
            username: currentUser.username,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            phone: currentUser.phone,
            email: currentUser.email,
            avatar: currentUser.avatar
        },
        images: [...existingImages, ...selectedImages]
    };

    // Валідація
    if (!formData.title || !formData.description || !formData.price || !formData.species || !formData.location) {
        showMessage('Будь ласка, заповніть всі обов\'язкові поля', 'error');
        return;
    }

    if (formData.images.length === 0) {
        showMessage('Будь ласка, додайте хоча б одне фото', 'error');
        return;
    }

    try {
        showMessage('Оновлення оголошення...', 'info');
        
        const updatedAd = await BirdBoardAPI.updateAdvertisement(currentAd.id, formData);
        console.log('Оголошення оновлено:', updatedAd);
        
        showMessage('Оголошення успішно оновлено!', 'success');
        
        // Перенаправлення на сторінку оголошення через 2 секунди
        setTimeout(() => {
            window.location.href = `advertisement.html?id=${currentAd.id}`;
        }, 2000);
        
    } catch (error) {
        console.error('Помилка оновлення:', error);
        showMessage(`Помилка при оновленні оголошення: ${error.message}`, 'error');
    }
}

// Показ повідомлень
function showMessage(message, type = 'info') {
    const existingMessage = document.querySelector('.ad-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ad-message ad-message-${type}`;
    messageDiv.textContent = message;
    
    messageDiv.style.cssText = `
        padding: 15px 20px;
        margin: 20px 0;
        border-radius: 10px;
        font-weight: 600;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
    `;
    
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
    
    const form = document.getElementById('editAdForm');
    if (form) {
        form.parentNode.insertBefore(messageDiv, form);
    }
    
    if (type !== 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// Функція для отримання шляху до зображення
function getImagePath(image) {
    if (image.path) {
        return `http://localhost:3000${image.path}`;
    } else if (image.data) {
        return image.data;
    }
    return '../images/placeholder-bird.jpg';
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ЗАВАНТАЖЕННЯ СТОРІНКИ РЕДАГУВАННЯ ===');
    
    // Перевірка авторизації
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

    const adId = getAdIdFromURL();
    if (adId) {
        loadAdData(adId);
    } else {
        showMessage('ID оголошення не вказано', 'error');
        setTimeout(() => window.location.href = '../index.html', 2000);
        return;
    }

    // Ініціалізація форми
    const form = document.getElementById('editAdForm');
    if (form) {
        form.addEventListener('submit', updateAdvertisement);
    }

    // Ініціалізація завантаження зображень
    initImageUpload();

    // Ініціалізація лічильника символів
    const textarea = document.getElementById('editAdDescription');
    if (textarea) {
        textarea.addEventListener('input', updateCharCount);
    }

    // Кнопка скасування
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Скасувати редагування? Внесені зміни не будуть збережені.')) {
                window.location.href = `advertisement.html?id=${adId}`;
            }
        });
    }

    console.log('=== ІНІЦІАЛІЗАЦІЯ РЕДАГУВАННЯ ЗАВЕРШЕНА ===');
});