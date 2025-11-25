import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    ru: {
        // Header
        home: "ГЛАВНАЯ",
        directory: "СПРАВОЧНИК",
        catalog: "КАТАЛОГ",
        about: "О ПРОЕКТЕ",
        contacts: "КОНТАКТЫ",
        complaint: "ОСТАВИТЬ ЖАЛОБУ",
        dashboard: "Личный кабинет",
        login: "Вход",
        language: "Язык",

        // Home Page
        emissions_title: "Выбросы в атмосферу",
        monitoring_title: "Мониторинг",
        air_quality: "Качества Воздуха",
        almaty_risk: "Алматы находится в зоне риска. Зимой \"тепловая шапка\" запирает вредные вещества в городе. Мы визуализируем невидимые угрозы для вашего здоровья.",
        region_label: "РЕГИОН",
        region_value: "АЛМАТЫ",
        pollutants_title: "ОСНОВНЫЕ ЗАГРЯЗНИТЕЛИ",
        sources_info: "Источники: ТЭЦ, Автотранспорт, Частный сектор. Влияют на дыхательную и кровеносную системы.",

        // Pollutants
        pm_desc: "мельчайшие частицы пыли и сажи, вызывающие болезни дыхания.",
        co_desc: "угарный газ, нарушающий доставку кислорода.",
        no2_name: "Диоксид азота",
        so2_name: "Диоксид серы",
        o3_name: "Озон",
        h2s_name: "Сероводород",

        // About Section
        digital_shield: "О проекте",
        almaty: "",
        about_desc: "Наш сервис помогает жителям Алматы следить за качеством воздуха в реальном времени. Мы собираем данные о загрязнителях и погодных условиях, отображаем их на карте и предоставляем аналитику. Цель — сделать информацию доступной и помочь в улучшении экологии города.",
        data_collection: "Сбор данных 24/7",
        analytics: "Аналитика загрязнений",
        open_access: "Открытый доступ",
        fig_caption: "Актуальность проблемы подтверждена жителями.",
        survey_result: "В опросе среди жителей Алматы мы выявили актуальность веб-сайта для мониторинга качества воздуха.",
        join_network: "ПРИСОЕДИНЯЙТЕСЬ К СЕТИ",
        data_help: "Ваши данные помогают калибровать систему.",
        take_survey: "ПРОЙТИ ОПРОС",

        // Forecast Section
        forecast_title: "Прогноз",
        weather_data: "ДАННЫЕ ПОГОДЫ",
        o2_forecast: "Прогноз O₂",
        o2_level: "Уровень O₂",
        oxygen_data: "ДАННЫЕ КИСЛОРОДА",

        // Footer
        footer_desc: "ICPAIR – следи за качеством воздуха в режиме реального времени. Данные о загрязнении, прогнозы и аналитика для жителей города.",
        copyright: "© 2025 ICPAIR. Все права защищены.",
        socials: "Мы в соцсетях:",
        contact_us: "Свяжитесь с нами:",

        // Sensor Catalog
        catalog_title: "Каталог Датчиков",
        catalog_subtitle: "Профессиональное оборудование для личного мониторинга",
        go_to_shop: "ПЕРЕЙТИ В МАГАЗИН",

        // Map Legend
        map_legend_title: "Уровень качества воздуха (AQI)",
        aqi_good: "Хорошо",
        aqi_moderate: "Умеренно",
        aqi_unhealthy_sensitive: "Вредно для чувствительных групп",
        aqi_unhealthy: "Вредно",
        aqi_very_unhealthy: "Очень вредно",
        aqi_hazardous: "Опасно",

        // PM Charts
        sensor_data: "ДАННЫЕ ДАТЧИКА",
        live: "LIVE",
        pm25_value: "Уровень PM2.5",
        pm10_value: "Уровень PM10",

        // Complaint Modal
        complaint_modal_title: "Оставить жалобу на экологическую проблему",
        complaint_modal_subtitle: "Здесь вы можете оставить жалобу на экологическую проблему в вашем районе",
        complaint_title_label: "Заголовок",
        complaint_title_placeholder: "Например: Вред автомобилей здоровью",
        complaint_category_label: "Категория",
        complaint_category_placeholder: "-- Выберите категорию --",
        complaint_district_label: "Район города Алматы",
        complaint_district_placeholder: "-- Выберите район --",
        complaint_desc_label: "Описание",
        complaint_desc_placeholder: "Опишите проблему подробнее...",
        complaint_user_info: "Введите ваши данные, чтобы отправить жалобу",
        complaint_name_label: "Ваше имя",
        complaint_name_placeholder: "Имя",
        complaint_email_label: "Ваш e-mail",
        complaint_submit_btn: "Отправить",
        complaint_success: "Жалоба успешно отправлена!",
        complaint_error: "Ошибка при отправке жалобы",

        // Categories
        cat_transport: "Транспортные выбросы",
        cat_industrial: "Промышленные загрязнения",
        cat_dust: "Пыль и строительные загрязнения",
        cat_waste: "Свалки и отходы",
        cat_heating: "Выбросы от отопления и частных домов",

        // Districts
        dist_almaly: "Алмалинский район",
        dist_medeu: "Медеуский район",
        dist_auezov: "Ауэзовский район",
        dist_nauryzbay: "Наурызбайский район",
        dist_bostandyk: "Бостандыкский район",
        dist_alatau: "Алатауский район",
        dist_zhetysu: "Жетысуский район",
        dist_turksib: "Турксибский район",

        // Errors
        err_title: "Введите заголовок",
        err_category: "Выберите категорию",
        err_district: "Выберите район",
        err_desc: "Введите описание",
        err_name: "Введите имя",
        err_email: "Введите email",
        err_email_invalid: "Некорректный email"
    },
    en: {
        // Header
        home: "HOME",
        directory: "DIRECTORY",
        catalog: "CATALOG",
        about: "ABOUT",
        contacts: "CONTACTS",
        complaint: "FILE COMPLAINT",
        dashboard: "Dashboard",
        login: "Login",
        language: "Language",

        // Home Page
        emissions_title: "Atmospheric Emissions",
        monitoring_title: "Air Quality",
        air_quality: "Monitoring",
        almaty_risk: "Almaty is in a risk zone. In winter, a \"thermal cap\" traps harmful substances in the city. We visualize invisible threats to your health.",
        region_label: "REGION",
        region_value: "ALMATY",
        pollutants_title: "MAIN POLLUTANTS",
        sources_info: "Sources: TPP, Transport, Private sector. Affect respiratory and circulatory systems.",

        // Pollutants
        pm_desc: "tiny particles of dust and soot causing respiratory diseases.",
        co_desc: "carbon monoxide disrupting oxygen delivery.",
        no2_name: "Nitrogen Dioxide",
        so2_name: "Sulfur Dioxide",
        o3_name: "Ozone",
        h2s_name: "Hydrogen Sulfide",

        // About Section
        digital_shield: "About the Project",
        almaty: "",
        about_desc: "Our service helps Almaty residents monitor air quality in real-time. We collect data on pollutants and weather conditions, display them on a map, and provide analytics. Our goal is to make information accessible and help improve the city's ecology.",
        data_collection: "24/7 Data Collection",
        analytics: "Pollution Analytics",
        open_access: "Open Access",
        fig_caption: "The urgency of the problem is confirmed by residents.",
        survey_result: "In a survey among Almaty residents, we identified the relevance of a website for air quality monitoring.",
        join_network: "JOIN THE NETWORK",
        data_help: "Your data helps calibrate the system.",
        take_survey: "TAKE SURVEY",

        // Forecast Section
        forecast_title: "Forecast",
        weather_data: "WEATHER DATA",
        o2_forecast: "O₂ Forecast",
        o2_level: "O₂ Level",
        oxygen_data: "OXYGEN DATA",

        // Footer
        footer_desc: "ICPAIR – monitor air quality in real-time. Pollution data, forecasts, and analytics for city residents.",
        copyright: "© 2025 ICPAIR. All rights reserved.",
        socials: "Follow us:",
        contact_us: "Contact us:",

        // Sensor Catalog
        catalog_title: "Sensor Catalog",
        catalog_subtitle: "Professional equipment for personal monitoring",
        go_to_shop: "GO TO SHOP",

        // Map Legend
        map_legend_title: "Air Quality Level (AQI)",
        aqi_good: "Good",
        aqi_moderate: "Moderate",
        aqi_unhealthy_sensitive: "Unhealthy for Sensitive Groups",
        aqi_unhealthy: "Unhealthy",
        aqi_very_unhealthy: "Very Unhealthy",
        aqi_hazardous: "Hazardous",

        // PM Charts
        sensor_data: "SENSOR DATA",
        live: "LIVE",
        pm25_value: "PM2.5 Value",
        pm10_value: "PM10 Value",

        // Complaint Modal
        complaint_modal_title: "File a complaint about an environmental issue",
        complaint_modal_subtitle: "Here you can file a complaint about an environmental issue in your area",
        complaint_title_label: "Title",
        complaint_title_placeholder: "Example: Harm of cars to health",
        complaint_category_label: "Category",
        complaint_category_placeholder: "-- Select category --",
        complaint_district_label: "District of Almaty",
        complaint_district_placeholder: "-- Select district --",
        complaint_desc_label: "Description",
        complaint_desc_placeholder: "Describe the problem in detail...",
        complaint_user_info: "Enter your details to submit the complaint",
        complaint_name_label: "Your Name",
        complaint_name_placeholder: "Name",
        complaint_email_label: "Your E-mail",
        complaint_submit_btn: "Submit",
        complaint_success: "Complaint submitted successfully!",
        complaint_error: "Error submitting complaint",

        // Categories
        cat_transport: "Transport emissions",
        cat_industrial: "Industrial pollution",
        cat_dust: "Dust and construction pollution",
        cat_waste: "Landfills and waste",
        cat_heating: "Emissions from heating and private houses",

        // Districts
        dist_almaly: "Almaly district",
        dist_medeu: "Medeu district",
        dist_auezov: "Auezov district",
        dist_nauryzbay: "Nauryzbay district",
        dist_bostandyk: "Bostandyk district",
        dist_alatau: "Alatau district",
        dist_zhetysu: "Zhetysu district",
        dist_turksib: "Turksib district",

        // Errors
        err_title: "Enter title",
        err_category: "Select category",
        err_district: "Select district",
        err_desc: "Enter description",
        err_name: "Enter name",
        err_email: "Enter email",
        err_email_invalid: "Invalid email"
    },
    kk: {
        // Header
        home: "БАСТЫ БЕТ",
        directory: "АНЫҚТАМАЛЫҚ",
        catalog: "КАТАЛОГ",
        about: "ЖОБА ТУРАЛЫ",
        contacts: "БАЙЛАНЫС",
        complaint: "ШАҒЫМ ҚАЛДЫРУ",
        dashboard: "Жеке кабинет",
        login: "Кіру",
        language: "Тіл",

        // Home Page
        emissions_title: "Атмосфералық шығарындылар",
        monitoring_title: "Ауа Сапасының",
        air_quality: "Мониторингі",
        almaty_risk: "Алматы қауіпті аймақта орналасқан. Қыста \"жылу қақпағы\" зиянды заттарды қалада ұстап қалады. Біз сіздің денсаулығыңызға төнетін көрінбейтін қауіптерді көрсетеміз.",
        region_label: "АЙМАҚ",
        region_value: "АЛМАТЫ",
        pollutants_title: "НЕГІЗГІ ЛАСТАУШЫЛАР",
        sources_info: "Көздер: ЖЭО, Көлік, Жеке сектор. Тыныс алу және қан айналым жүйелеріне әсер етеді.",

        // Pollutants
        pm_desc: "тыныс алу ауруларын тудыратын ұсақ шаң мен күйе бөлшектері.",
        co_desc: "оттегінің жеткізілуін бұзатын көміртек тотығы.",
        no2_name: "Азот диоксиді",
        so2_name: "Күкірт диоксиді",
        o3_name: "Озон",
        h2s_name: "Күкіртсутек",

        // About Section
        digital_shield: "Жоба туралы",
        almaty: "",
        about_desc: "Біздің қызмет Алматы тұрғындарына ауа сапасын нақты уақытта бақылауға көмектеседі. Біз ластаушылар мен ауа-райы туралы деректерді жинаймыз, оларды картада көрсетеміз және аналитика ұсынамыз. Мақсатымыз – ақпаратты қолжетімді ету және қаланың экологиясын жақсартуға көмектесу.",
        data_collection: "24/7 Деректерді жинау",
        analytics: "Ластану аналитикасы",
        open_access: "Ашық қолжетімділік",
        fig_caption: "Мәселенің өзектілігі тұрғындармен расталған.",
        survey_result: "Алматы тұрғындары арасындағы сауалнамада біз ауа сапасын бақылауға арналған веб-сайттың өзектілігін анықтадық.",
        join_network: "ЖЕЛІГЕ ҚОСЫЛЫҢЫЗ",
        data_help: "Сіздің деректеріңіз жүйені калибрлеуге көмектеседі.",
        take_survey: "САУАЛНАМАДАН ӨТУ",

        // Forecast Section
        forecast_title: "Болжам",
        weather_data: "АУА-РАЙЫ ДЕРЕКТЕРІ",
        o2_forecast: "O₂ Болжамы",
        o2_level: "O₂ Деңгейі",
        oxygen_data: "ОТТЕГІ ДЕРЕКТЕРІ",
        // Footer
        footer_desc: "ICPAIR – ауа сапасын нақты уақытта бақылаңыз. Қала тұрғындары үшін ластану деректері, болжамдар және аналитика.",
        copyright: "© 2025 ICPAIR. Барлық құқықтар қорғалған.",
        socials: "Біз әлеуметтік желілердеміз:",
        contact_us: "Бізбен байланысыңыз:",

        // Sensor Catalog
        catalog_title: "Датчиктер Каталогы",
        catalog_subtitle: "Жеке мониторингке арналған кәсіби жабдық",
        go_to_shop: "ДҮКЕНГЕ ӨТУ",

        // Map Legend
        map_legend_title: "Ауа сапасының деңгейі (AQI)",
        aqi_good: "Жақсы",
        aqi_moderate: "Орташа",
        aqi_unhealthy_sensitive: "Сезімтал топтар үшін зиянды",
        aqi_unhealthy: "Зиянды",
        aqi_very_unhealthy: "Өте зиянды",
        aqi_hazardous: "Қауіпті",

        // PM Charts
        sensor_data: "ДАТЧИК ДЕРЕКТЕРІ",
        live: "ТІКЕЛЕЙ",
        pm25_value: "PM2.5 Деңгейі",
        pm10_value: "PM10 Деңгейі",

        // Complaint Modal
        complaint_modal_title: "Экологиялық мәселе бойынша шағым беру",
        complaint_modal_subtitle: "Мұнда сіз өз ауданыңыздағы экологиялық мәселе бойынша шағым қалдыра аласыз",
        complaint_title_label: "Тақырып",
        complaint_title_placeholder: "Мысалы: Көліктердің денсаулыққа зияны",
        complaint_category_label: "Санат",
        complaint_category_placeholder: "-- Санатты таңдаңыз --",
        complaint_district_label: "Алматы қаласының ауданы",
        complaint_district_placeholder: "-- Ауданды таңдаңыз --",
        complaint_desc_label: "Сипаттама",
        complaint_desc_placeholder: "Мәселені толығырақ сипаттаңыз...",
        complaint_user_info: "Шағым жіберу үшін деректеріңізді енгізіңіз",
        complaint_name_label: "Сіздің атыңыз",
        complaint_name_placeholder: "Аты",
        complaint_email_label: "Сіздің E-mail",
        complaint_submit_btn: "Жіберу",
        complaint_success: "Шағым сәтті жіберілді!",
        complaint_error: "Шағым жіберу қатесі",

        // Categories
        cat_transport: "Көлік шығарындылары",
        cat_industrial: "Өнеркәсіптік ластану",
        cat_dust: "Шаң және құрылыс ластануы",
        cat_waste: "Қоқыс полигондары мен қалдықтар",
        cat_heating: "Жылу және жеке үйлерден шығатын шығарындылар",

        // Districts
        dist_almaly: "Алмалы ауданы",
        dist_medeu: "Медеу ауданы",
        dist_auezov: "Әуезов ауданы",
        dist_nauryzbay: "Наурызбай ауданы",
        dist_bostandyk: "Бостандық ауданы",
        dist_alatau: "Алатау ауданы",
        dist_zhetysu: "Жетісу ауданы",
        dist_turksib: "Түрксіб ауданы",

        // Errors
        err_title: "Тақырыпты енгізіңіз",
        err_category: "Санатты таңдаңыз",
        err_district: "Ауданды таңдаңыз",
        err_desc: "Сипаттаманы енгізіңіз",
        err_name: "Атыңызды енгізіңіз",
        err_email: "Email енгізіңіз",
        err_email_invalid: "Жарамсыз email"
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ru');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('appLanguage');
        if (savedLanguage && translations[savedLanguage]) {
            setLanguage(savedLanguage);
        }
    }, []);

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
            localStorage.setItem('appLanguage', lang);
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
