const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

describe('blog tests', async () => {
  beforeAll(async () => {
    await Blog.remove({})
    
    for (let blog of helper.initialBlogs) {
      await new Blog(blog).save()
    }
  })

  test('blogs are returned as json', async () => {
    const blogsInDatabase = await helper.blogsInDb()
    
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    response.body
      .map(Blog.format)
      .forEach(blog => {
        expect(blogsInDatabase.map(b => b._id)).toContainEqual(blog._id)
    })
  })
  
  describe('addition of new blog', async () => {

    test.only('a valid blog can be added ', async () => {
      const newBlog = {
        title: "POST test",
        author: "jokahara",
        url: "www.asdf.com",
        likes: 0
      } 

      const blogsBefore = await helper.blogsInDb()
      
      console.log('TOKEN:', token)

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const blogsAfter = await helper.blogsInDb()
    
      expect(blogsAfter.length).toBe(blogsBefore.length + 1)
      expect(blogsAfter.map(b => b.title)).toContainEqual(newBlog.title)
    })
  
    test('blog without title returns 400 Bad request', async () => {
      const newBlog = {
        author: "jokahara",
        url: "www.asdf.com",
        likes: 2
      }  

      const blogsBefore = await helper.blogsInDb()
  
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter.length).toBe(blogsBefore.length)
    })
  
    test('blog without url returns 400 Bad request', async () => {
      const newBlog = {
        title: "POST test 2",
        author: "jokahara",
        likes: 2
      }  
  
      const blogsBefore = await helper.blogsInDb()
  
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter.length).toBe(blogsBefore.length)
    })
  
    test('no likes equals 0', async () => {
      const newBlog = {
        title: "POST test 3",
        author: "jokahara",
        url: "www.asdf.com",
      }
  
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
    
      const blogsAfter = await helper.blogsInDb()
      expect(blogsAfter.find(b => b.title === newBlog.title).likes).toEqual(0)
    })
  })

  describe('deletion of a blog', async () => {
    let addedBlog

    beforeAll(async () => {
      addedBlog = new Blog({
        title: "DELETE test",
        author: "jokahara",
        url: "www.asdf.com",
        likes: 0
      })
      await addedBlog.save()
    })

    test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
      const blogsBefore = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter).not.toContain(addedBlog.content)
      expect(blogsAfter.length).toBe(blogsBefore.length - 1)
    })
  })
})

describe('user tests', async () => {

  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })
  
  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBefore = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length+1)
    
    const usernames = usersAfter.map(u=>u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fails if username already taken', async () => {
    const usersBefore = await helper.usersInDb()
  
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen'
    }
  
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(result.body).toEqual({ error: 'username must be unique'})
  
    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('POST /api/users fails if password is too short', async () => {
    const usersBefore = await helper.usersInDb()
  
    const newUser = {
      username: 'root2',
      name: 'Superuser2',
      password: 'a'
    }
  
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(result.body).toEqual({ error: 'password length must be 3 or longer'})
  
    const usersAfter = await helper.usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })
})

afterAll(() => {
  server.close()
})
