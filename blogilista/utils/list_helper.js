const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => sum + blog.likes
  
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (previous, current) => {
    return current.likes > previous.likes ? current : previous
  }

  const result = blogs.reduce(reducer)

  return {
    title: result.title,
    author: result.author,
    likes: result.likes
  }
}

const mostBlogs = (blogs) => {
  const reducer = (authors, blog) => {
    const index = authors.findIndex((e) => e.author === blog.author)

    if (index === -1) {
      return authors.concat({ author: blog.author, blogs: 1 })
    }

    authors[index].blogs++
    return authors
  }
  
  const result = blogs.reduce(reducer, [])

  return result.reduce((p, c) => p.blogs > c.blogs ? p : c)
}

const mostLikes = (blogs) => {
  const reducer = (authors, blog) => {
    const index = authors.findIndex((e) => e.author === blog.author)

    if (index === -1) {
      return authors.concat({ author: blog.author, likes: blog.likes })
    }

    authors[index].likes += blog.likes
    return authors
  }
  
  const result = blogs.reduce(reducer, [])
  
  return result.reduce((p, c) => p.likes > c.likes ? p : c)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}