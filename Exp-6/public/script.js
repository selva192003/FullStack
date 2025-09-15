// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const dashboardSection = document.getElementById('dashboard-section');
    const formTitle = document.getElementById('form-title');
    const showLoginLink = document.getElementById('show-login');
    const showSignupLink = document.getElementById('show-signup');
    const logoutButton = document.getElementById('logout-button');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const dashboardUsername = document.getElementById('dashboard-username');
    const dashboardEmail = document.getElementById('dashboard-email');

    // Function to display messages
    function showMessage(message, type = 'error') {
        messageText.textContent = message;
        messageBox.classList.remove('hidden', 'bg-red-100', 'bg-green-100');
        messageBox.classList.remove('border-red-400', 'border-green-400');
        messageBox.classList.remove('text-red-700', 'text-green-700');

        if (type === 'success') {
            messageBox.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
        } else {
            messageBox.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
        }
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 5000); // Hide after 5 seconds
    }

    // Function to switch between forms
    function showSignup() {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        dashboardSection.classList.add('hidden');
        formTitle.textContent = 'Sign Up';
        messageBox.classList.add('hidden'); // Clear messages on form switch
    }

    function showLogin() {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        formTitle.textContent = 'Login';
        messageBox.classList.add('hidden'); // Clear messages on form switch
    }

    function showDashboard(username, email) {
        signupForm.classList.add('hidden');
        loginForm.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        formTitle.textContent = 'Dashboard';
        dashboardUsername.textContent = username;
        dashboardEmail.textContent = email;
        messageBox.classList.add('hidden'); // Clear messages on dashboard view
    }

    // Check authentication status on page load
    async function checkAuthAndDisplayContent() {
        try {
            const response = await fetch('/api/user-info'); // Try to access protected user info
            if (response.ok) {
                const data = await response.json();
                showDashboard(data.username, data.email);
            } else {
                // If not authenticated, show login form
                showLogin();
                // Check if there's a message from the server (e.g., redirect from protected route)
                const urlParams = new URLSearchParams(window.location.search);
                const message = urlParams.get('message');
                if (message) {
                    showMessage(decodeURIComponent(message), 'error');
                    // Clear the message from URL to prevent re-display on refresh
                    history.replaceState(null, '', window.location.pathname);
                }
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            showMessage('Could not connect to server. Please try again later.', 'error');
            showLogin(); // Default to login if server is unreachable
        }
    }

    // Event Listeners for form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                showMessage(data.message, 'success');
                showLogin(); // Show login form after successful signup
            } else {
                showMessage(data.message);
            }
        } catch (error) {
            console.error('Signup error:', error);
            showMessage('Network error during signup. Please try again.');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                showMessage(data.message, 'success');
                // Cookies are automatically handled by the browser
                // Redirect to dashboard or update UI
                checkAuthAndDisplayContent(); // Re-check auth to show dashboard
            } else {
                showMessage(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error during login. Please try again.');
        }
    });

    logoutButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
            });
            const data = await response.json();
            if (response.ok) {
                showMessage(data.message, 'success');
                showLogin(); // Show login form after logout
            } else {
                showMessage(data.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
            showMessage('Network error during logout. Please try again.');
        }
    });

    // Event Listeners for form toggling
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });

    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSignup();
    });

    // Initial check on page load
    checkAuthAndDisplayContent();
});
