import { type NextPage } from "next";
import Head from "next/head";

const SinglePostPage: NextPage = () => { 
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex justify-center h-screen">
        Single Post Page
      </main>
    </>
  );
};

export default SinglePostPage;
