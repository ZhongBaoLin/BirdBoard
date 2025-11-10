 // Бургер-меню
        document.addEventListener('DOMContentLoaded', function() {
            const burgerMenu = document.getElementById('burgerMenu');
            const mobileMenu = document.getElementById('mobileMenu');
            const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
            const body = document.body;

            function toggleMenu() {
                burgerMenu.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                mobileMenuOverlay.classList.toggle('active');
                body.classList.toggle('menu-open');
            }

            burgerMenu.addEventListener('click', toggleMenu);
            
            // Закриття меню при кліку на оверлей
            mobileMenuOverlay.addEventListener('click', toggleMenu);

            // Закриття меню при кліку на посилання
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', toggleMenu);
            });

            // Обробка кнопки додавання оголошення
            const addAdBtn = document.getElementById('addAdBtn');
            const mobileAddAdBtn = document.getElementById('mobileAddAdBtn');
            const authModal = document.getElementById('authModal');

            function handleAddAdClick(e) {
                e.preventDefault();
                // Закриваємо меню якщо відкрите
                if (mobileMenu.classList.contains('active')) {
                    toggleMenu();
                }
                // Тут буде перевірка авторизації
                authModal.style.display = 'flex';
            }

            if (addAdBtn) addAdBtn.addEventListener('click', handleAddAdClick);
            if (mobileAddAdBtn) mobileAddAdBtn.addEventListener('click', handleAddAdClick);

            // Закриття модального вікна
            const closeModal = document.querySelectorAll('.close-modal');
            closeModal.forEach(btn => {
                btn.addEventListener('click', () => {
                    authModal.style.display = 'none';
                });
            });

            // Закриття меню при зміні розміру вікна на великий
            window.addEventListener('resize', function() {
                if (window.innerWidth > 968 && mobileMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });

        function scrollToAdvertisements() {
            const section = document.getElementById('advertisements');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }