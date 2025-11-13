// lib/posts.js
// ---------------------------------------------------------------

const DATA_URL =
  'https://dev-cs55nflteams.pantheonsite.io/wp-json/twentytwentyone-child/v1/latest-posts/1';

async function fetchPosts() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch posts from Pantheon:', err);
    return [];
  }
}

// ------------------------------------------------------------------
// 3. getAllIds – ONLY valid posts with ID
// ------------------------------------------------------------------
export async function getAllIds() {
  const posts = await fetchPosts();

  return posts
    .filter(post => post && post.ID && typeof post.ID === 'string' || typeof post.ID === 'number')
    .map((post) => ({
      params: {
        id: String(post.ID),
      },
    }));
}

// ------------------------------------------------------------------
// 4. getSortedList – safe mapping
// ------------------------------------------------------------------
export async function getSortedList() {
  const posts = await fetchPosts();

  const validPosts = posts.filter(post =>
    post && post.ID && post.post_title && post.post_date
  );

  const sorted = [...validPosts].sort((a, b) =>
    a.post_title.localeCompare(b.post_title)
  );

  return sorted.map((post) => ({
    id: String(post.ID),
    name: post.post_title,
    date: post.post_date,
  }));
}

// ------------------------------------------------------------------
// 5. getData – return null if not found (safe for JSON)
// ------------------------------------------------------------------
export async function getData(idRequested) {
  const posts = await fetchPosts();
  const post = posts.find((p) => String(p.ID) === idRequested);

  if (!post || !post.ID) {
    return null; // ← Critical: null is JSON-serializable
  }

  return {
    id: String(post.ID),
    title: post.post_title || 'Untitled',
    date: post.post_date || '',
    contentHtml: post.post_content || '',
  };
}
