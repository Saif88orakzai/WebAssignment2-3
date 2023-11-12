//import { setToken } from './login.js';

const token = localStorage.getItem('token');
console.log(token);

async function fetchBlogs() {
    const response = await fetch('http://localhost:3000/blogs');
    const blogs = await response.json();

    const blogList = document.getElementById('blogList');
    blogList.innerHTML = '';

    blogs.forEach(blog => {
        const listItem = document.createElement('li');
        listItem.textContent = `${blog.title}: ${blog.content}`;
        blogList.appendChild(listItem);
    });
}

// Event listener for creating a blog post
document.getElementById('createBlogForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    const response = await fetch('http://localhost:3000/blogs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (response.ok) {
        alert('Blog post created successfully');
        fetchBlogs();
    } else {
        alert('Failed to create blog post');
    }
});

// Event listener for updating a blog post
document.getElementById('updateBlogForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    const response = await fetch(`http://localhost:3000/blogs/${formData.get('blogId')}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (response.ok) {
        alert('Blog post updated successfully');
        fetchBlogs();
    } else {
        alert('Failed to update blog post');
    }
});

// Event listener for deleting a blog post
document.getElementById('deleteBlogForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    const response = await fetch(`http://localhost:3000/blogs/${formData.get('blogId')}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.ok) {
        alert('Blog post deleted successfully');
        fetchBlogs();
    } else {
        alert('Failed to delete blog post');
    }
});

// Initial fetch of blog posts when the page loads
fetchBlogs();