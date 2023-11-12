const express = require('express');
const mongoose = require('mongoose');
const User = require('./model/user');
const Blog = require('./model/blog');
const jwt = require('jsonwebtoken');
const cors = require('cors');

mongoose.connect('mongodb://0.0.0.0:27017/webAssignment', {
  useNewUrlParser: true,
});
const app = express();
app.use(express.json());
app.use(cors());

const secretKey = 'Hi';

//Register User
app.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const user = await User.create({ email, password, username });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

//Login User
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password === password) {
      const token = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: '1h',
      });
      const role = user.role;
      res.json({ token, role });

    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Blog Post
app.post('/blogs', authenticateToken, async (req, res) => {
  const { title, content, rating, comment, categories } = req.body;

  try {
    const blog = await Blog.create({
      title,
      content,
      owner: req.user.userId,
      rating: rating || 0,
      comments: comment ? [{ user: req.user.userId, text: comment }] : [],
      categories: categories ? categories.split(',') : [],
    });

    // Notify followers about the new post
    const followers = await User.find({ _id: { $in: req.user.followers } });
    followers.forEach(async (follower) => {
      await Notification.create({
        user: follower._id,
        message: `New post from ${req.user.username}: ${title}`,
      });
    });

    res.status(201).json({ message: 'Blog post created successfully', blog });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create blog post' });
  }
});

// Read All Blog Posts
// app.get('/blogs', async (req, res) => {
//   try {
//     const blogs = await Blog.find();
//     res.json(blogs);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve blog posts' });
//   }
// });

// Read Single Blog Post
app.get('/blogs/:blogId', async (req, res) => {
  const blogId = req.params.blogId;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve blog post' });
  }
});

// Update Blog Post
app.put('/blogs/:blogId', authenticateToken, async (req, res) => {
  const blogId = req.params.blogId;
  const { title, content } = req.body;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    if (blog.owner !== req.user.userId) {
      return res.status(403).json({ error: 'Permission denied. You are not the owner of this blog post' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;

    await blog.save();

    res.json({ message: 'Blog post updated successfully', blog });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// Delete Blog Post
app.delete('/blogs/:blogId', authenticateToken, async (req, res) => {
  const blogId = req.params.blogId;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    if (blog.owner !== req.user.userId) {
      return res.status(403).json({ error: 'Permission denied. You are not the owner of this blog post' });
    }

    await blog.remove();

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Retrieve User Profile
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

//Update User Profile
app.put('/profile', authenticateToken, async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.email = email || user.email;
    user.password = password || user.password;
    user.username = username || user.username;

    await user.save();

    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Delete User Profile
app.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.remove();

    res.json({ message: 'User profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user profile' });
  }
});

// Read All Blog Posts with Pagination and Filtering
app.get('/blogs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Number of items per page
    const skip = (page - 1) * limit;

    // Filtering options
    const filter = {};
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: 'i' }; // Case-insensitive title search
    }

    const blogs = await Blog.find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / limit);

    res.json({
      page,
      totalPages,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve blog posts' });
  }
});

// Follow a user
app.post('/users/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user.following.push(userToFollow._id);
    userToFollow.followers.push(req.user._id);

    await Promise.all([req.user.save(), userToFollow.save()]);

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
app.post('/users/unfollow/:userId', authenticateToken, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user.following.pull(userToUnfollow._id);
    userToUnfollow.followers.pull(req.user._id);

    await Promise.all([req.user.save(), userToUnfollow.save()]);

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Retrieve User Feed
app.get('/feed', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('following', 'blogs');

    const followedBlogs = user.following.reduce((blogs, blogger) => {
      return blogs.concat(blogger.blogs);
    }, []);

    // Sort the blogs by date or any other criteria
    const sortedBlogs = followedBlogs.sort((a, b) => b.createdAt - a.createdAt);

    res.json(sortedBlogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user feed' });
  }
});

// Update the 'Create Blog Post' Endpoint to Send Notifications:
app.post('/blogs', authenticateToken, async (req, res) => {
  const { title, content, rating, comment } = req.body;

  try {
    const blog = await Blog.create({
      title,
      content,
      owner: req.user.userId,
      rating: rating || 0,
      comments: comment ? [{ user: req.user.userId, text: comment }] : [],
    });

    // Notify followers about the new post
    const followers = await User.find({ _id: { $in: req.user.followers } });
    followers.forEach(async (follower) => {
      await Notification.create({
        user: follower._id,
        message: `New post from ${req.user.username}: ${title}`,
      });
    });

    res.status(201).json({ message: 'Blog post created successfully', blog });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create blog post' });
  }
});

// Update the 'Create Comment' Endpoint to Send Notifications:
app.post('/blogs/:blogId/comments', authenticateToken, async (req, res) => {
  const { text } = req.body;
  const blogId = req.params.blogId;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    blog.comments.push({ user: req.user.userId, text });
    await blog.save();

    // Notify the blog owner about the new comment
    const blogOwner = await User.findById(blog.owner);
    await Notification.create({
      user: blogOwner._id,
      message: `New comment on your post: ${blog.title}`,
    });

    res.json({ message: 'Comment added successfully', blog });
  } catch (error) {
    res.status(500).json({ error: 'Comment added successfully' });
  }
});

//Blog Post Search
app.get('/search', async (req, res) => {
  try {
    const { keywords, categories, author, sortBy, order } = req.query;

    // Filtering options
    const filter = {};
    if (keywords) {
      filter.$or = [
        { title: { $regex: keywords, $options: 'i' } }, // Case-insensitive title search
        { content: { $regex: keywords, $options: 'i' } }, // Case-insensitive content search
      ];
    }
    if (categories) {
      filter.categories = { $in: categories.split(',') };
    }
    if (author) {
      const user = await User.findOne({ username: author });
      if (user) {
        filter.owner = user._id;
      } else {
        // No user found with the specified username
        return res.status(404).json({ error: 'Author not found' });
      }
    }

    // Sorting options
    const sort = {};
    if (sortBy) {
      sort[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      // Default sorting by date in descending order
      sort.createdAt = -1;
    }

    const blogs = await Blog.find(filter)
      .sort(sort)
      .exec();

    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// View all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id username email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user list' });
  }
});

// Block/disable a user
app.post('/users/:userId/block', authenticateToken, async (req, res) => {
  try {
    const userToBlock = await User.findById(req.params.userId);
    if (!userToBlock) {
      return res.status(404).json({ error: 'User not found' });
    }

    userToBlock.blocked = true;
    await userToBlock.save();

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// List all blog posts
app.get('/blog-posts', async (req, res) => {
  try {
    const blogPosts = await Blog.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $addFields: {
          author: { $arrayElemAt: ['$author', 0] },
        },
      },
      {
        $project: {
          title: 1,
          author: '$author.username',
          creationDate: '$createdAt',
          averageRating: '$rating',
        },
      },
    ]);

    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve blog posts' });
  }
});

// View a particular blog post
app.get('/blog-posts/:blogId', async (req, res) => {
  try {
    const blogPost = await Blog.findById(req.params.blogId)
      .populate('owner', 'username')
      .select('title content owner createdAt rating');

    if (!blogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(blogPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve blog post' });
  }
});

// Disable a blog
app.post('/blog-posts/:blogId/disable', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    if (blog.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Permission denied. You are not the owner of this blog post' });
    }

    blog.disabled = true;
    await blog.save();

    res.json({ message: 'Blog post disabled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable blog post' });
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
