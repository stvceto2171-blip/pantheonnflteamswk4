// lib/posts.js
// ---------------------------------------------------------------
const DATA_URL =
  'https://dev-cs55nflteams.pantheonsite.io/wp-json/twentytwentyone-child/v1/latest-posts/1';

/**
 * Centralised fetch – returns an empty array on any error.
 */
async function fetchPosts() {
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('Fetched posts:', data); // ← ADD THIS FOR DEBUG
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch posts from Pantheon:', err);
    return [];
  }
}

// ------------------------------------------------------------------
// 1. getAllPostIds – for getStaticPaths
// ------------------------------------------------------------------
export async function getAllPostIds() {
  const posts = await fetchPosts();
  return posts
    .filter(post => post && post.id)  // ← Use .id
    .map(post => ({
      params: { id: String(post.id) },  // ← .id
    }));
}

// ------------------------------------------------------------------
// 2. getSortedPostsData – for index page
// ------------------------------------------------------------------
export async function getSortedPostsData() {
  const posts = await fetchPosts();
  const validPosts = posts.filter(post => post && post.id && post.title && post.date);
  const sorted = [...validPosts].sort((a, b) => a.title.localeCompare(b.title));
  return sorted.map(post => ({
    id: String(post.id),
    name: post.title,   // ← .title
    date: post.date,    // ← .date
  }));
}

// ------------------------------------------------------------------
// 3. getPostData – for individual post
// ------------------------------------------------------------------
export async function getPostData(idRequested) {
  const posts = await fetchPosts();
  const post = posts.find(p => String(p.id) === idRequested);
  if (!post || !post.id) return null;

  // Try to fetch full post content from WordPress REST API
  let contentHtml = '';
  try {
    const fullRes = await fetch(`https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/posts/${post.id}`);
    if (fullRes.ok) {
      const fullPost = await fullRes.json();
      contentHtml = fullPost.content?.rendered || '';
    }
  } catch (err) {
    console.error('Failed to fetch full post:', err);
  }

  return {
    id: String(post.id),
    title: post.title || 'Untitled',
    date: post.date || '',
    contentHtml: contentHtml || '<p>No content available.</p>',
  };
}
