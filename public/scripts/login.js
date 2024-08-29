async function handleLogin(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Basic client-side validation
    if (!username || !password) {
        alert('Username and password are required.');
        return;
    }

    try {
        // Send a POST request to the server
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            // Redirect to the wardrobe page on success
            window.location.href = '/wardrobe';
        } else {
            // Handle errors
            const result = await response.json();
            alert(result.message || 'Invalid credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in.');
    }
}