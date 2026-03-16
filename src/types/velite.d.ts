// Type declarations for Velite-generated JSON content modules
// Resolved via tsconfig paths: #site/* → .velite/*

declare module '#site/blogs' {
  interface Blog {
    title: string
    slug: string
    description: string
    date: string
    updated?: string
    tags: string[]
    published: boolean
    image?: string
    body: string
    readingTime: number
  }

  const blogs: Blog[]
  export default blogs
}

declare module '#site/diaries' {
  interface Diary {
    title: string
    slug: string
    description?: string
    date: string
    mood: 'happy' | 'sad' | 'reflective' | 'grateful' | 'motivated'
    published: boolean
    body: string
    readingTime: number
  }

  const diaries: Diary[]
  export default diaries
}
