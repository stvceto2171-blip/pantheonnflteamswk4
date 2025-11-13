// pages/posts/[id].js
// ---------------------------------------------------------------
import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../lib/posts';  // ← FIXED
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

// ------------------------------------------------------------------
// Default export: Render post or 404 if invalid
// ------------------------------------------------------------------
export default function Post({ postData }) {
  // If postData is null or missing required fields → show 404-like UI
  if (!postData || !postData.id) {
    return (
      <Layout>
        <Head>
          <title>Post Not Found</title>
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>Post Not Found</h1>
          <p>Sorry, this post does not exist or is unavailable.</p>
        </article>
      </Layout>
    );
  }
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}

// ------------------------------------------------------------------
// getStaticPaths: Generate only valid IDs
// ------------------------------------------------------------------
export async function getStaticPaths() {
  const paths = await getAllPostIds();  // ← FIXED
  return {
    paths,
    fallback: false, // 404 for unknown paths
  };
}

// ------------------------------------------------------------------
// getStaticProps: Return notFound: true if post missing
// ------------------------------------------------------------------
export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);  // ← FIXED
  // If no post found → return 404
  if (!postData) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      postData,
    },
  };
}
