// --- Modern Tab/Navigation System ---
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked menu item
    const selectedMenuItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedMenuItem) {
        selectedMenuItem.classList.add('active');
    }
}

// --- Enhanced Single file processing UI updates ---
function showSingleFileResults(original_base64, processed_base64) {
    const resultsDiv = document.getElementById('single-file-results');
    resultsDiv.innerHTML = `
        <div class="image-container">
            <h3>Original Image</h3>
            <img src="data:image/png;base64,${original_base64}" alt="Original Image">
        </div>
        <div class="image-container">
            <h3>Processed Image</h3>
            <img src="data:image/png;base64,${processed_base64}" alt="Processed Image">
            <div style="margin-top: 16px;">
                <button class="btn-primary" onclick="pywebview.api.save_image('data:image/png;base64,${processed_base64}')">
                    <i data-feather="save"></i>
                    Save Image
                </button>
            </div>
        </div>
    `;
    
    // Re-initialize Feather icons for new elements
    feather.replace();
    
    // Hide loading spinner
    document.getElementById('loading-spinner').style.display = 'none';
}

// --- Enhanced Batch processing UI updates ---
function updateFolderPath(type, path) {
    const pathElement = document.getElementById(`${type}-folder-path`);
    if (pathElement) {
        // Show just the folder name for cleaner UI
        const folderName = path.split('\\').pop() || path.split('/').pop() || path;
        pathElement.textContent = folderName;
        pathElement.title = path; // Show full path on hover
    }
}

function addLogMessage(message) {
    const logConsole = document.getElementById('log-console');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span style="color: #666; margin-right: 8px;">[${timestamp}]</span>${message}`;
    logConsole.appendChild(logEntry);
    logConsole.scrollTop = logConsole.scrollHeight;
}

function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(progress)}%`;
    }
}

// --- Enhanced UI feedback with modern notifications ---
function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-feather="${type === 'error' ? 'alert-circle' : type === 'success' ? 'check-circle' : 'info'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i data-feather="x"></i>
        </button>
    `;
    
    // Add styles for notifications
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 60px;
                right: 20px;
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 1001;
                min-width: 300px;
                box-shadow: 0 8px 32px var(--shadow-dark);
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-error { border-left: 4px solid var(--error-color); }
            .notification-success { border-left: 4px solid var(--success-color); }
            .notification-info { border-left: 4px solid var(--accent-color); }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
                color: var(--text-primary);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }
            
            .notification-close:hover {
                background: var(--background-tertiary);
                color: var(--text-primary);
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    feather.replace();
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// --- Utility Functions ---
function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = `${filename}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
}

function clearLog() {
    const logConsole = document.getElementById('log-console');
    if (logConsole) {
        logConsole.innerHTML = '';
    }
}

// --- Theme Management ---
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
}

// --- Initialize Application ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather icons
    feather.replace();
    
    // Setup window controls
    document.getElementById('minimize-btn').addEventListener('click', () => {
        pywebview.api.minimize_window();
    });

    document.getElementById('maximize-btn').addEventListener('click', () => {
        pywebview.api.toggle_maximize_window();
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        pywebview.api.close_window();
    });
    
    // Setup sidebar navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
            }
        });
    });
    
    // Setup theme toggle
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
        });
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Setup drag and drop for upload area
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent-color)';
            uploadArea.style.background = 'var(--background-secondary)';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = 'var(--surface-color)';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = 'var(--surface-color)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // Handle dropped files here
                showNotification('Drag and drop support coming soon!', 'info');
            }
        });
    }
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to AI Background Remover Pro!', 'success');
    }, 1000);
});

// --- Enhanced loading state management ---
function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// --- Keyboard shortcuts ---
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + O for open file
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        pywebview.api.select_image();
    }
    
    // Ctrl/Cmd + B for batch processing
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        switchTab('batch');
    }
    
    // Ctrl/Cmd + , for settings
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        switchTab('settings');
    }
});

// --- PyWebView ready event ---
document.addEventListener('pywebviewready', () => {
    console.log('PyWebView is ready!');
    showNotification('Application initialized successfully!', 'success');
});