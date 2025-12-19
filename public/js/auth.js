async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    // Allow visitor mode if empty (legacy support)
    if (u === '' && p === '') {
         currentUser = 'visitor';
         loginSuccess();
         return;
    }

    try {
        const data = await apiCall('/auth/login', 'POST', { username: u, password: p });
        localStorage.setItem('token', data.token);
        
        // Use role from server response
        currentUser = data.role || 'visitor';
        
        loginSuccess();
    } catch (error) {
        showToast('Accès refusé', error.message, 'error');
    }
}

function loginSuccess() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-layout').classList.remove('hidden');
    initApp();
    showToast('Connexion réussie', `Bienvenue en mode ${currentUser === 'admin' ? 'Administrateur' : 'Visiteur'}`, 'success');
}

async function handleRegister(e) {
    e.preventDefault();
    const u = document.getElementById('reg-username').value;
    const p = document.getElementById('reg-password').value;
    const pConfirm = document.getElementById('reg-password-confirm').value;

    if (p !== pConfirm) {
        showToast('Erreur', 'Les mots de passe ne correspondent pas', 'error');
        return;
    }

    try {
        const data = await apiCall('/auth/register', 'POST', { username: u, password: p });
        localStorage.setItem('token', data.token);
        currentUser = 'visitor'; // Default to visitor on register
        
        hideRegisterModal();
        loginSuccess();
    } catch (error) {
        showToast('Erreur', error.message, 'error');
    }
}

function logout() {
    showPopup('Déconnexion', 'Voulez-vous vraiment quitter l\'établissement ?', 'warning', 'Quitter', 'Rester', () => {
        currentUser = null;
        cart = [];
        localStorage.removeItem('token');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-layout').classList.add('hidden');
        showToast('Déconnexion', 'Vous avez quitté l\'établissement', 'info');
    });
}

function quickFill(role) {
    document.getElementById('username').value = role;
    document.getElementById('password').value = role === 'admin' ? 'password123' : '';
}

function showRegisterModal() {
    document.getElementById('register-modal').classList.remove('hidden');
}

function hideRegisterModal() {
    document.getElementById('register-modal').classList.add('hidden');
}
