const CONFIG = {
    API_BASE: ''
};

const state = {
    token: localStorage.getItem('admin_token') || null,
    staff: null, // my profile
    lessons: [],
    teachers: [],
    languages: []
};

// --- API Utils ---
async function apiFetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    // if body is FormData, drop Content-Type
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const res = await fetch(CONFIG.API_BASE + path, { ...options, headers });
    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch (e) { err = { detail: res.statusText }; }
        if (res.status === 401) { logout(); }
        throw new Error(err.detail || 'Ошибка запроса');
    }
    return res.json();
}

function showToast(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast show ${type}`;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function logout() {
    state.token = null;
    state.staff = null;
    localStorage.removeItem('admin_token');
    switchScreen('screen-login');
}

// --- Modals ---
let activeDeleteAction = null;
function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    activeDeleteAction = null;
}

function confirmDelete(title, callback) {
    document.getElementById('delete-modal').classList.remove('hidden');
    // .querySelector doesn't properly remove old events, so we overwrite onclick
    document.getElementById('delete-confirm-btn').onclick = () => {
        closeModals();
        callback();
    };
}

// --- Initialization & Data Fetching ---
async function init() {
    if (state.token) {
        try {
            state.staff = await apiFetch('/staff/me');
            bootstrapDashboard();
        } catch (e) {
            switchScreen('screen-login');
        }
    } else {
        switchScreen('screen-login');
    }
}

async function bootstrapDashboard() {
    switchScreen('screen-dashboard');
    document.getElementById('role-label').textContent = state.staff.role === 'admin' ? 'Администратор' : 'Преподаватель';
    document.getElementById('staff-name').textContent = `${state.staff.first_name} ${state.staff.last_name}`;

    if (state.staff.role === 'admin') {
        document.getElementById('teachers-section').classList.remove('hidden');
    }

    await loadLanguages();
    await loadTeachers();
    await loadLessons();
}

// --- Login Form ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const res = await apiFetch('/staff/login', { method: 'POST', body: formData });
        state.token = res.access_token;
        localStorage.setItem('admin_token', state.token);

        state.staff = await apiFetch('/staff/me');
        showToast('Успешный вход', 'success');
        bootstrapDashboard();
    } catch (e) {
        showToast(e.message, 'error');
    }
});

// --- Languages loading ---
async function loadLanguages() {
    try {
        state.languages = await apiFetch('/languages/');
        let opts = state.languages.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
        document.getElementById('lesson-language').innerHTML = opts;
        document.getElementById('assign-language-select').innerHTML = opts;
    } catch (e) { }
}

// --- Teachers loading ---
async function loadTeachers() {
    try {
        state.teachers = await apiFetch('/staff/');

        // Populate lesson teacher select
        let teacherOpts = `<option value="">Я (для админа можно выбрать)</option>`;
        teacherOpts += state.teachers.filter(t => t.role === 'teacher').map(t => `<option value="${t.id}">${t.first_name} ${t.last_name}</option>`).join('');
        document.getElementById('lesson-teacher').innerHTML = teacherOpts;

        if (state.staff.role === 'admin') {
            const list = document.getElementById('teachers-list');
            list.innerHTML = state.teachers.map(t => `
                <div class="booking-card">
                  <div class="booking-top">
                    <div class="booking-info">
                      <div class="booking-lang">${t.first_name} ${t.last_name}</div>
                      <div class="booking-teacher">${t.email} (${t.role})</div>
                      <div class="booking-teacher" style="margin-top:4px; font-size:11px;">Языки: ${t.languages?.map(l => l.name).join(', ') || 'нет'}</div>
                    </div>
                  </div>
                  <div style="display:flex; gap:12px; margin-top:12px;">
                      <button class="btn-primary" style="font-size:10px; padding:6px 12px; border-radius:8px;" onclick="openAssignLang('${t.id}')">Язык</button>
                      ${t.id !== state.staff.id ? `<button class="btn-cancel" onclick="deleteTeacher('${t.id}')">Удалить</button>` : ''}
                  </div>
                </div>
            `).join('');
        }
    } catch (e) { }
}

// --- Staff Management (Admin) ---
window.openCreateStaffModal = function () {
    document.getElementById('staff-form').reset();
    document.getElementById('staff-modal').classList.remove('hidden');
}

document.getElementById('staff-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        email: document.getElementById('staff-email').value,
        password: document.getElementById('staff-password').value,
        first_name: document.getElementById('staff-first-name').value,
        last_name: document.getElementById('staff-last-name').value,
        role: document.getElementById('staff-role').value
    };
    try {
        await apiFetch('/staff/', { method: 'POST', body: JSON.stringify(data) });
        showToast('Пользователь создан', 'success');
        closeModals();
        loadTeachers();
    } catch (e) { showToast(e.message, 'error'); }
});

window.deleteTeacher = function (id) {
    confirmDelete('Удалить пользователя?', async () => {
        try {
            await apiFetch(`/staff/${id}`, { method: 'DELETE' });
            showToast('Удалено', 'success');
            loadTeachers();
        } catch (e) { showToast(e.message, 'error'); }
    });
}

window.openAssignLang = function (staffId) {
    document.getElementById('assign-staff-id').value = staffId;
    document.getElementById('assign-lang-modal').classList.remove('hidden');
}

document.getElementById('assign-lang-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const staffId = document.getElementById('assign-staff-id').value;
    const langId = document.getElementById('assign-language-select').value;
    try {
        await apiFetch(`/staff/${staffId}/languages/${langId}`, { method: 'POST' });
        showToast('Язык добавлен', 'success');
        closeModals();
        loadTeachers();
    } catch (e) { showToast(e.message, 'error'); }
});

// --- Lessons Management ---
async function loadLessons() {
    try {
        const query = state.staff.role === 'teacher' ? `?teacher_id=${state.staff.id}` : '';
        state.lessons = await apiFetch('/lessons/' + query);

        const list = document.getElementById('lessons-list');
        if (state.lessons.length === 0) {
            list.innerHTML = `<p class="filter-hint">Нет созданных занятий</p>`;
            return;
        }

        list.innerHTML = state.lessons.map(l => {
            const start = new Date(l.start_time).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            const end = new Date(l.end_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="booking-card ${l.status === 'cancelled' ? 'cancelled' : ''}">
                  <div class="booking-top">
                    <div class="booking-info">
                      <div class="booking-lang">${l.language_name}</div>
                      <div class="booking-teacher">Учитель: ${l.teacher_name}</div>
                      <div style="font-size:12px; margin-top:4px;">Мест: ${l.capacity - l.available_slots}/${l.capacity} | ${l.type}</div>
                    </div>
                  </div>
                  <div class="booking-time-row" style="margin-top:8px;">
                    <div class="booking-time">
                      <span class="material-symbols-rounded">schedule</span>
                      ${start} — ${end}
                    </div>
                  </div>
                  <div style="display:flex; gap:12px; margin-top:12px;">
                      <button class="btn-primary" style="font-size:10px; padding:6px 12px; border-radius:8px;" onclick='openEditLesson(${JSON.stringify(l)})'>Изменить</button>
                      <button class="btn-cancel" onclick="deleteLesson('${l.id}')">Удалить</button>
                  </div>
                </div>
            `;
        }).join('');
    } catch (e) { }
}

function toLocalISO(dateObj) {
    const offset = dateObj.getTimezoneOffset() * 60000;
    return (new Date(dateObj - offset)).toISOString().substring(0, 16);
}

window.openCreateLessonModal = function () {
    const f = document.getElementById('lesson-form');
    f.reset();
    document.getElementById('lesson-id').value = '';
    document.getElementById('lesson-modal-title').textContent = 'Создать занятие';

    // Default times
    const now = new Date();
    document.getElementById('lesson-start').value = toLocalISO(now);
    now.setHours(now.getHours() + 1);
    document.getElementById('lesson-end').value = toLocalISO(now);

    document.getElementById('lesson-modal').classList.remove('hidden');
}

window.openEditLesson = function (lesson) {
    const f = document.getElementById('lesson-form');
    f.reset();
    document.getElementById('lesson-id').value = lesson.id;
    document.getElementById('lesson-modal-title').textContent = 'Изменить занятие';

    document.getElementById('lesson-teacher').value = lesson.teacher_id;
    document.getElementById('lesson-language').value = lesson.language_id;
    document.getElementById('lesson-type').value = lesson.type;
    document.getElementById('lesson-capacity').value = lesson.capacity;

    document.getElementById('lesson-start').value = toLocalISO(new Date(lesson.start_time));
    document.getElementById('lesson-end').value = toLocalISO(new Date(lesson.end_time));

    document.getElementById('lesson-modal').classList.remove('hidden');
}

document.getElementById('lesson-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('lesson-id').value;

    let teacher = document.getElementById('lesson-teacher').value;
    if (!teacher) teacher = null;

    const start_time = (new Date(document.getElementById('lesson-start').value)).toISOString();
    const end_time = (new Date(document.getElementById('lesson-end').value)).toISOString();

    try {
        if (id) {
            await apiFetch(`/lessons/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    start_time, end_time,
                    capacity: parseInt(document.getElementById('lesson-capacity').value)
                })
            });
            showToast('Занятие обновлено', 'success');
        } else {
            await apiFetch(`/lessons/`, {
                method: 'POST',
                body: JSON.stringify({
                    teacher_id: teacher,
                    language_id: document.getElementById('lesson-language').value,
                    type: document.getElementById('lesson-type').value,
                    capacity: parseInt(document.getElementById('lesson-capacity').value),
                    start_time, end_time
                })
            });
            showToast('Занятие создано', 'success');
        }
        closeModals();
        loadLessons();
    } catch (e) { showToast(e.message, 'error'); }
});

window.deleteLesson = function (id) {
    confirmDelete('Удалить это занятие?', async () => {
        try {
            await apiFetch(`/lessons/${id}`, { method: 'DELETE' });
            showToast('Удалено', 'success');
            loadLessons();
        } catch (e) { showToast(e.message, 'error'); }
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);
