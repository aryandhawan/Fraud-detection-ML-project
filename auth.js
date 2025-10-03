// Authentication state
let isAuthenticated = false;

// Check authentication status
async function checkAuthentication() {
    const result = await api.checkAuth();
    isAuthenticated = result.ok;
    return isAuthenticated;
}

// Show toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show/hide elements
function showElement(id) {
    document.getElementById(id)?.classList.remove('hidden');
}

function hideElement(id) {
    document.getElementById(id)?.classList.add('hidden');
}

// Show error in form
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

// Set button loading state
function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
    } else {
        button.disabled = false;
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    hideError('login-error');
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const button = event.target.querySelector('button[type="submit"]');
    
    setButtonLoading(button, true);
    
    const result = await api.login(username, password);
    
    if (result.ok) {
        isAuthenticated = true;
        window.location.hash = '#dashboard';
    } else {
        showError('login-error', result.data.error || 'Invalid username or password');
    }
    
    setButtonLoading(button, false);
}

// Handle register
async function handleRegister(event) {
    event.preventDefault();
    hideError('register-error');
    hideError('register-success');
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const button = event.target.querySelector('button[type="submit"]');
    
    setButtonLoading(button, true);
    
    const result = await api.register(username, password);
    
    if (result.status === 201) {
        showToast('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => {
            window.location.hash = '#login';
        }, 1500);
    } else {
        showError('register-error', result.data.error || 'Registration failed');
    }
    
    setButtonLoading(button, false);
}

// Handle logout
async function logout() {
    const result = await api.logout();
    
    if (result.ok) {
        isAuthenticated = false;
        showToast('Logged out successfully', 'success');
        window.location.hash = '#login';
    } else {
        showToast('Logout failed. Please try again.', 'error');
    }
}

// Initialize auth check on load
window.addEventListener('load', async () => {
    // If not on login/register page, check auth
    const hash = window.location.hash;
    if (hash !== '#login' && hash !== '#register' && hash !== '') {
        const authenticated = await checkAuthentication();
        if (!authenticated) {
            window.location.hash = '#login';
        }
    }
});
