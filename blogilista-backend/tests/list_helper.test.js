const listHelper = require('../utils/list_helper')
const blogs = require('./test_helper').initialBlogs

describe('list helpers', () => {
  test('dummy is called', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
  })

  describe('total likes', () => {
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
      }
    ]

    test('when list is empty likes equals 0', () => {
      const result = listHelper.totalLikes([])
      expect(result).toBe(0)
    })

    test('when list has only one blog equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      expect(result).toBe(5)
    })

    test('when list has more than one blog', () => {
      const result = listHelper.totalLikes(blogs)
      expect(result).toBe(36)
    })
  })

  describe('find', () => {
    test('find blog with most likes', () => {
      const expectedValue = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        likes: 12
      }

      expect(listHelper.favoriteBlog(blogs)).toEqual(expectedValue)
    })

    test('find author with most blogs', () => {
      const expectedValue = {
        author: "Robert C. Martin",
        blogs: 3
      }

      expect(listHelper.mostBlogs(blogs)).toEqual(expectedValue)
    })

    test('find author with most likes', () => {
      const expectedValue = {
        author: "Edsger W. Dijkstra",
        likes: 17
      }

      expect(listHelper.mostLikes(blogs)).toEqual(expectedValue)
    })
  })
})