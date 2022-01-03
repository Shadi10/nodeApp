const {
  validationResult
} = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  try {
    const totalItems = await Post.find().countDocuments()
    const posts = await Post.find().skip((currentPage - 1) * perPage).limit(perPage);
    res.status(200).json({
      message: 'Fetched posts successfully',
      posts: posts,
      totalItems: totalItems
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error)
  }
}
exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    const error = new Error('Validation Failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image Provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId
  })
  try {
    const result = await post.save()
    const user = await User.findById(req.userId);
    user.posts.push(post);
    const result2 = await user.save()

    res.status(201).json({
      message: 'Post created successfully!',
      post: post
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}
exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId)
    if (!post) {
      const error = new Error('Could not find post');
      error.statusCode = 404;
      throw error;
    } else {
      res.status(200).json({
        message: 'Post fetched',
        post: post
      })
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.updatePost = async (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const postId = req.params.postId;
  let imageUrl = req.body.image;
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    const error = new Error('Validation Failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked');
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId)
    if (!post) {
      const error = new Error('Could not find post');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) { // req.userId got from the login
      const error = new Error('Not Authorized');
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();
    res.status(200).json({
      message: 'Post updated successfully!',
      post: result
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  };
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => {
    console.log(err);
  })
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId)
  if (!post) {
    const error = new Error('Could not find post');
    error.statusCode = 404;
    throw (error);
  }
  if (post.creator.toString() !== req.userId) { // req.userId got from the login
    const error = new Error('Not Authorized');
    error.statusCode = 403;
    throw error;
  }
  clearImage(post.imageUrl);
  try{
  const result = await Post.findByIdAndRemove(postId);
  const user = await User.findById(req.userId)
   user.posts.pull(postId);

  const result1 = await user.save();
  console.log(result1);
  res.status(200).json({
      message: 'Post Deleted Successfully !',
    })}
    catch(error){
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  }