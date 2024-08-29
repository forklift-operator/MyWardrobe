async function handleRegister(event) {
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
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            // Redirect to the wardrobe page on success
            window.location.href = '/';
            
        } else {
            // Handle errors
            const result = await response.json();
            alert(result.message || 'An error occurred while registering.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while registering.');
    }
}