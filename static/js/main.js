// ===== API Utilities =====
const API_BASE = '/api';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'エラーが発生しました');
    return data;
}

function formatDate(isoStr) {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleDateString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Clock =====
function updateClock() {
    const el = document.getElementById('current-datetime');
    if (el) {
        el.textContent = new Date().toLocaleString('ja-JP', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
}
setInterval(updateClock, 1000);
updateClock();

// ===== Modal Helpers =====
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// Close modal when clicking backdrop
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
});

// ===== Badge Helper =====
function statusBadge(isActive) {
    return isActive
        ? '<span class="badge badge--active">有効</span>'
        : '<span class="badge badge--inactive">無効</span>';
}


// ===================================================================
//  USERS MODULE
// ===================================================================

let deleteTargetType = null;
let deleteTargetId = null;

async function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="loading-cell"><div class="spinner"></div></td></tr>';
    try {
        const data = await apiFetch('/users');
        const countEl = document.getElementById('users-count');
        if (countEl) countEl.textContent = `全 ${data.total} 件`;

        if (data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="table-empty">ユーザーがいません。新規作成してください。</td></tr>';
            return;
        }
        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td><strong>${escapeHtml(u.username)}</strong></td>
                <td>${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.full_name || '-')}</td>
                <td>${statusBadge(u.is_active)}</td>
                <td>${formatDate(u.created_at)}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn--sm btn--secondary" onclick="openEditUserModal(${u.id})">編集</button>
                        <button class="btn btn--sm btn--danger" onclick="openDeleteModal('user', ${u.id}, '${escapeHtml(u.username)}')">削除</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-error">読み込みエラー: ${e.message}</td></tr>`;
    }
}

async function loadRecentUsers() {
    const container = document.getElementById('recent-users-table');
    if (!container) return;
    try {
        const data = await apiFetch('/users?limit=5');
        if (data.users.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:24px">データがありません</p>';
            return;
        }
        container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>ユーザー名</th><th>メール</th><th>ステータス</th><th>作成日</th></tr></thead>
                    <tbody>
                        ${data.users.map(u => `
                            <tr>
                                <td>${u.id}</td>
                                <td><strong>${escapeHtml(u.username)}</strong></td>
                                <td>${escapeHtml(u.email)}</td>
                                <td>${statusBadge(u.is_active)}</td>
                                <td>${formatDate(u.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (e) {
        container.innerHTML = `<p style="color:var(--red)">読み込みエラー: ${e.message}</p>`;
    }
}

function openCreateUserModal() {
    document.getElementById('user-modal-title').textContent = 'ユーザー作成';
    document.getElementById('user-id').value = '';
    document.getElementById('user-form').reset();
    document.getElementById('user-is-active-group').style.display = 'none';
    openModal('user-modal');
}

async function openEditUserModal(id) {
    try {
        const user = await apiFetch(`/users/${id}`);
        document.getElementById('user-modal-title').textContent = 'ユーザー編集';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-full-name').value = user.full_name || '';
        document.getElementById('user-bio').value = user.bio || '';
        document.getElementById('user-is-active').checked = user.is_active;
        document.getElementById('user-is-active-group').style.display = 'block';
        openModal('user-modal');
    } catch (e) {
        showToast('ユーザー情報の取得に失敗しました: ' + e.message, 'error');
    }
}

async function submitUserForm() {
    const id = document.getElementById('user-id').value;
    const body = {
        username:  document.getElementById('user-username').value,
        email:     document.getElementById('user-email').value,
        full_name: document.getElementById('user-full-name').value || null,
        bio:       document.getElementById('user-bio').value || null,
    };
    if (id) {
        body.is_active = document.getElementById('user-is-active').checked;
    }

    const saveBtn = document.getElementById('user-save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';

    try {
        if (id) {
            await apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('ユーザーを更新しました');
        } else {
            await apiFetch('/users', { method: 'POST', body: JSON.stringify(body) });
            showToast('ユーザーを作成しました');
        }
        closeModal('user-modal');
        loadUsers();
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '保存';
    }
}


// ===================================================================
//  PRODUCTS MODULE
// ===================================================================

async function loadProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell"><div class="spinner"></div></td></tr>';
    try {
        const data = await apiFetch('/products');
        const countEl = document.getElementById('products-count');
        if (countEl) countEl.textContent = `全 ${data.total} 件`;

        if (data.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="table-empty">商品がありません。新規作成してください。</td></tr>';
            return;
        }
        tbody.innerHTML = data.products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>${escapeHtml(p.category || '-')}</td>
                <td>${formatPrice(p.price)}</td>
                <td>${p.stock.toLocaleString()}</td>
                <td>${statusBadge(p.is_active)}</td>
                <td>${formatDate(p.created_at)}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn--sm btn--secondary" onclick="openEditProductModal(${p.id})">編集</button>
                        <button class="btn btn--sm btn--danger" onclick="openDeleteModal('product', ${p.id}, '${escapeHtml(p.name)}')">削除</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="table-error">読み込みエラー: ${e.message}</td></tr>`;
    }
}

function openCreateProductModal() {
    document.getElementById('product-modal-title').textContent = '商品作成';
    document.getElementById('product-id').value = '';
    document.getElementById('product-form').reset();
    document.getElementById('product-is-active-group').style.display = 'none';
    openModal('product-modal');
}

async function openEditProductModal(id) {
    try {
        const product = await apiFetch(`/products/${id}`);
        document.getElementById('product-modal-title').textContent = '商品編集';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('product-is-active').checked = product.is_active;
        document.getElementById('product-is-active-group').style.display = 'block';
        openModal('product-modal');
    } catch (e) {
        showToast('商品情報の取得に失敗しました: ' + e.message, 'error');
    }
}

async function submitProductForm() {
    const id = document.getElementById('product-id').value;
    const priceVal = parseFloat(document.getElementById('product-price').value);
    const stockVal = parseInt(document.getElementById('product-stock').value, 10);

    if (isNaN(priceVal) || priceVal <= 0) {
        showToast('価格は0より大きい数値を入力してください', 'error');
        return;
    }
    if (isNaN(stockVal) || stockVal < 0) {
        showToast('在庫数は0以上の整数を入力してください', 'error');
        return;
    }

    const body = {
        name:        document.getElementById('product-name').value,
        description: document.getElementById('product-description').value || null,
        price:       priceVal,
        stock:       stockVal,
        category:    document.getElementById('product-category').value || null,
    };
    if (id) {
        body.is_active = document.getElementById('product-is-active').checked;
    }

    const saveBtn = document.getElementById('product-save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';

    try {
        if (id) {
            await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('商品を更新しました');
        } else {
            await apiFetch('/products', { method: 'POST', body: JSON.stringify(body) });
            showToast('商品を作成しました');
        }
        closeModal('product-modal');
        loadProducts();
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '保存';
    }
}


// ===================================================================
//  DELETE MODAL (shared between Users and Products)
// ===================================================================

function openDeleteModal(type, id, name) {
    deleteTargetType = type;
    deleteTargetId = id;
    const label = type === 'user' ? 'ユーザー' : '商品';
    document.getElementById('delete-target-label').innerHTML =
        `この${label} <strong>${escapeHtml(name)}</strong> を削除してもよろしいですか？`;
    openModal('delete-modal');
}

async function confirmDelete() {
    const confirmBtn = document.getElementById('delete-confirm-btn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = '削除中...';

    try {
        const path = deleteTargetType === 'user'
            ? `/users/${deleteTargetId}`
            : `/products/${deleteTargetId}`;
        await apiFetch(path, { method: 'DELETE' });
        showToast('削除しました');
        closeModal('delete-modal');
        if (deleteTargetType === 'user') loadUsers();
        else loadProducts();
    } catch (e) {
        showToast('削除に失敗しました: ' + e.message, 'error');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '削除';
    }
}


// ===================================================================
//  SECURITY UTILITY
// ===================================================================

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
