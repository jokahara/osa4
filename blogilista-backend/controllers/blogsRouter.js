const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { username: 1, name: 1})

    response.json(blogs.map(Blog.format))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.title === undefined) {
      return response.status(400).json({ error: 'title missing' })
    }
    if (body.url === undefined) {
      return response.status(400).json({ error: 'url missing' })
    }

    let user = await User.findById(decodedToken.id)
    
    const blog = new Blog({
      ...body,
      likes: body.likes ? body.likes : 0,
      user: user._id
    })
    
    await user.set({ blogs: user.blogs.concat(blog._id) })
    await user.save()
    
    response.status(201).json(await blog.save())
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  
  if (body.title === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (body.url === undefined) {
    return response.status(400).json({ error: 'number missing' })
  }

  const blog = new Blog({
    _id: request.params.id,
    ...body
  })
  
  try {
    const result = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(result)
  } catch (error) {
    console.log()
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    const user = await User.findById(decodedToken.id)

    if (blog.user.toString() === decodedToken.id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      
      await user.set({ blogs: user.blogs.filter(b => b._id !== request.params.id) })
      await user.save()

      return response.status(204).end()
    }

    response.status(401).json({ error: 'token invalid' })
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter