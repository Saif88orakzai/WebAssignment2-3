const registerForm = document.getElementById("register-form");
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("emailr").value;
    const password = document.getElementById("passwordr").value;
    const username = document.getElementById("username").value;

    const url = "http://localhost:3000/register";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
    });

    if (response.ok) {
        alert("Registration successful. You can now log in.");
    } else {
        alert("Registration failed. Please try again.");
    }
});
