document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput'); // Поле поиска
    const institutionLinks = document.querySelectorAll('.institution-list a'); // Ссылки на учреждения
    const directoryContainer = document.getElementById('directoryContainer');
    const notification = document.getElementById('notification');
    let allData = []; // Хранение всех данных для поиска
    let departments = {}; // Хранение данных по отделам

    // Функция для отображения уведомлений
    function showNotification(message, type = 'success') {
        notification.innerText = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        // Скрыть уведомление через 3 секунды
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Парсинг CSV и группировка по отделам
    function loadCSV(file) {
        Papa.parse(file, {
            download: true,
            header: true,
            skipEmptyLines: true,
            encoding: "UTF-8",
            complete: function(results) {
                console.log("Результаты парсинга:", results); // Отладка
                const data = results.data;

                // Сброс текущих данных
                departments = {};
                allData = data;

                // Группируем сотрудников по отделам
                data.forEach(employee => {
                    let department = employee['Отдел'];
                    if (!departments[department]) {
                        departments[department] = [];
                    }
                    departments[department].push(employee);
                });

                renderDepartments(departments); // Отрисовка данных
                showNotification('Данные успешно загружены.');
            },
            error: function(error) {
                console.error("Ошибка при парсинге CSV:", error.message);
                showNotification(`Ошибка при парсинге CSV: ${error.message}`, 'error');
            }
        });
    }

    // Функция для рендеринга сотрудников по отделам
    function renderDepartments(departments) {
        directoryContainer.innerHTML = ''; // Очищаем контейнер перед рендерингом

        if (Object.keys(departments).length === 0) {
            directoryContainer.innerHTML = '<p>Нет данных для отображения.</p>';
            return;
        }

        // Проходим по каждому отделу
        for (let department in departments) {
            // Создаем блок для отдела
            let departmentBlock = document.createElement('div');
            departmentBlock.classList.add('department-block');

            // Заголовок отдела
            let departmentTitle = document.createElement('h2');
            departmentTitle.textContent = department;
            departmentBlock.appendChild(departmentTitle);

            // Создаем контейнер для сотрудников
            let employeeList = document.createElement('div');
            employeeList.classList.add('employee-list');

            // Проходим по сотрудникам отдела
            departments[department].forEach(employee => {
                // Создаем карточку сотрудника
                let employeeCard = document.createElement('div');
                employeeCard.classList.add('card');

                // Имя, Фамилия и Отчество
                const nameDiv = document.createElement('div');
                nameDiv.className = 'name';
                nameDiv.innerHTML = `
                    <span class="last-name">${employee['Фамилия']}</span>
                    <span class="first-patronymic">${employee['Имя']} ${employee['Отчество']}</span>
                `;
                employeeCard.appendChild(nameDiv);

                // Должность
                const positionDiv = document.createElement('div');
                positionDiv.className = 'position';
                positionDiv.innerText = employee['Должность'];
                employeeCard.appendChild(positionDiv);

                // Телефон и внутренний телефон
                const phoneDiv = document.createElement('div');
                phoneDiv.className = 'info phone';
                phoneDiv.innerHTML = `
                    <span class="phone-number">${employee['Телефон']}</span>
                    <span class="inner-phone-number">${employee['ВнутреннийТелефон'] || ''}</span>
                `;
                employeeCard.appendChild(phoneDiv);

                // Email
                const emailDiv = document.createElement('div');
                emailDiv.className = 'info email';
                emailDiv.innerHTML = `<a href="mailto:${employee['Email']}">${employee['Email']}</a>`;
                employeeCard.appendChild(emailDiv);

                // Контейнер для слова "Кабинет" и номера кабинета
                const cabinetContainer = document.createElement('div');
                cabinetContainer.className = 'cabinet-container';
                const cabinetLabel = document.createElement('div');
                cabinetLabel.className = 'cabinet-label';
                cabinetLabel.innerText = 'Кабинет';
                const cabinetDiv = document.createElement('div');
                cabinetDiv.className = 'cabinet-number';
                cabinetDiv.innerText = `${employee['Номер кабинета']}`;
                cabinetContainer.appendChild(cabinetLabel);
                cabinetContainer.appendChild(cabinetDiv);

                employeeCard.appendChild(cabinetContainer);

                // Добавляем карточку сотрудника в список сотрудников
                employeeList.appendChild(employeeCard);
            });

            // Добавляем список сотрудников в блок отдела
            departmentBlock.appendChild(employeeList);

            // Добавляем блок отдела в основной контейнер
            directoryContainer.appendChild(departmentBlock);
        }
    }

    // Функция для отображения карточек сотрудников в соответствии с поиском
    function displaySearchResults(query) {
        directoryContainer.innerHTML = ''; // Очищаем предыдущие результаты

        // Объект для хранения найденных сотрудников по отделам
        let filteredDepartments = {};

        // Проходим по каждому отделу и фильтруем сотрудников
        for (let department in departments) {
            const filteredEmployees = departments[department].filter(employee => {
                const fullName = `${employee['Имя']} ${employee['Фамилия']} ${employee['Отчество']} ${employee['Телефон']} ${employee['ВнутреннийТелефон']}`.toLowerCase();
                return fullName.includes(query);
            });

            // Если есть сотрудники, соответствующие запросу, добавляем их в новый объект
            if (filteredEmployees.length > 0) {
                filteredDepartments[department] = filteredEmployees;
            }
        }

        // Отображаем отфильтрованные отделы и сотрудников
        renderDepartments(filteredDepartments);
    }

    // Обработчик события ввода в поле поиска
    if (searchInput) {
        searchInput.addEventListener('input', function(event) {
            const query = event.target.value.toLowerCase();
            displaySearchResults(query);
        });
    }

    // Автоматическая загрузка первого учреждения при загрузке страницы
    if (institutionLinks.length > 0) {
        const firstLink = institutionLinks[0];
        firstLink.classList.add('active');
        const firstFile = firstLink.getAttribute('data-file');
        loadCSV(firstFile);
    }

    // Обработчики клика по учреждениям
    institutionLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const file = this.getAttribute('data-file');
            if (file) {
                institutionLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                loadCSV(file);
            }
        });
    });
});
