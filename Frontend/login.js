const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const url = "http://localhost:3000/login";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    

    if (response.ok) {
        const { token,role } = await response.json();
        console.log(role);
        localStorage.setItem("token", token);   
        console.log(token);

        if(role == "Admin"){
            window.location.href = "blogs.html";
        }
        else
             window.location.href = "blogs.html";
    } else {
        alert("Login failed. Please check your credentials.");
    }
});