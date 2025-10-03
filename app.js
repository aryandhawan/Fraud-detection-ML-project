function showPage(pageName) {
    // Hide all pages
    const pages = ['login-page', 'register-page', 'dashboard-page', 'history-page'];
    pages.forEach(page => hideElement(page));
    
    // Show/hide navigation
    if (pageName === 'login' || pageName === 'register') {
        hideElement('navigation');
    } else {
        showElement('navigation');
    }
    
    // Show requested page
    showElement(`${pageName}-page`);
}

async function navigate(route) {
    // Check authentication for protected routes
    if (route !== 'login' && route !== 'register') {
        const authenticated = await checkAuthentication();
        if (!authenticated) {
            window.location.hash = '#login';
            return;
        }
    }
    
    switch (route) {
        case 'login':
            showPage('login');
            break;
        case 'register':
            showPage('register');
            break;
        case 'dashboard':
            showPage('dashboard');
            initializePredictionForm();
            break;
        case 'history':
            showPage('history');
            loadHistory();
            break;
        default:
            window.location.hash = '#login';
    }
}

// Handle hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'login';
    navigate(hash);
});

// Initialize on load
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1) || 'login';
    navigate(hash);
});

// Prediction Form
function initializePredictionForm() {
    const container = document.getElementById('prediction-fields');
    if (container.children.length > 0) return; // Already initialized
    
    const fields = ['Time', ...Array.from({ length: 28 }, (_, i) => `V${i + 1}`), 'Amount'];
    
    fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label for="field-${field}">${field}</label>
            <input type="number" id="field-${field}" name="${field}" step="any" placeholder="0.00" required>
        `;
        container.appendChild(div);
    });
}

async function handlePredict(event) {
    event.preventDefault();
    
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    // Convert form data to transaction object
    const transactionData = {};
    for (const [key, value] of formData.entries()) {
        transactionData[key] = parseFloat(value) || 0;
    }
    
    setButtonLoading(button, true);
    
    const result = await api.predict(transactionData);
    
    if (result.ok) {
        showResultModal(result.data);
    } else {
        showToast('Prediction failed. Please try again.', 'error');
    }
    
    setButtonLoading(button, false);
}

// Result Modal
function showResultModal(result) {
    const modal = document.getElementById('result-modal');
    const modalContent = document.getElementById('result-modal-content');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    
    const isFraud = result.is_fraud;
    
    // Set modal styling
    if (isFraud) {
        modalContent.classList.add('fraud-alert');
        modalContent.classList.remove('legitimate-alert');
        title.className = 'modal-title fraud';
        title.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Fraud Alert
        `;
        message.className = 'result-box fraud';
    } else {
        modalContent.classList.add('legitimate-alert');
        modalContent.classList.remove('fraud-alert');
        title.className = 'modal-title legitimate';
        title.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Legitimate Transaction
        `;
        message.className = 'result-box legitimate';
    }
    
    message.textContent = result.prediction_label;
    modal.classList.remove('hidden');
}

function closeResultModal() {
    const modal = document.getElementById('result-modal');
    modal.classList.add('hidden');
}

// History Page
async function loadHistory() {
    const loading = document.getElementById('history-loading');
    const empty = document.getElementById('history-empty');
    const tableContainer = document.getElementById('history-table-container');
    const tableBody = document.getElementById('history-table-body');
    
    // Show loading
    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    tableContainer.classList.add('hidden');
    
    const result = await api.getHistory();
    
    loading.classList.add('hidden');
    
    if (result.ok && result.data.length > 0) {
        tableContainer.classList.remove('hidden');
        tableBody.innerHTML = '';
        
        result.data.forEach(item => {
            const row = document.createElement('tr');
            const timestamp = new Date(item.timestamp).toLocaleString();
            const isFraud = item.is_fraud;
            
            row.innerHTML = `
                <td>${timestamp}</td>
                <td>${item.prediction_result}</td>
                <td>
                    <span class="badge ${isFraud ? 'badge-fraud' : 'badge-legitimate'}">
                        ${isFraud ? 
                            `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg> Fraud` :
                            `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg> Legitimate`
                        }
                    </span>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } else {
        empty.classList.remove('hidden');
    }
}

// Helper function for history navigation
function showHistory() {
    window.location.hash = '#history';
}