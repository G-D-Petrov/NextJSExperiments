import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "react-hot-toast";
import { Loading, LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/page_layout";

import { api, RouterOutputs } from "~/utils/api";

const CreatePostWizzard = () => {

  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to post! Please try again later.");
    }
  });

  // TODO: Add some error handling here
  if ( !user ) return null;

  return (
  <div className="flex gap-4 w-full">
    <Image src={user.profileImageUrl} alt="Profile Image" className="w-16 h-16 rounded-full" width={56} height={56}/>
    <input 
      placeholder="Type something bitte"
      className="bg-transparent grow outline-none"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (input === "") return;
          mutate({ content: input });
        }
      }}
      disabled={isPosting}
    />
    {input !== "" && !isPosting && <button
      className="bg-blue-500 text-white rounded-md px-4 py-2"
      onClick={() => {
        mutate({ content: input });
      }}
      disabled={isPosting}
    >
      Post
    </button>}

    {isPosting && <div className="flex flex items-center"><Loading /></div>}
  </div>
  );

};

type PostWithUser = RouterOutputs['posts']['getAll'][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="border-b border-slate-400 p-4 flex gap-3">
      <Image src={author.profileImageUrl} alt="Author Profile Picture" className="w-16 h-16 rounded-full" width={56} height={56}/>
      <div className="flex flex-col">
        <div className="flex">
          <Link href={`/${author.id}`}><span>{`@${author.username}`}</span></Link> 
        </div>
        <Link href={`/posts/${post.id}`}><span>{post.content}</span>  </Link>
        
      </div>
    </div>
  );
};

const Feed = () => {
  const {data, isLoading} = api.posts.getAll.useQuery();

  if ( isLoading ) return <LoadingPage />;

  if ( !data ) return <div>Something went wrong...</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => { 

  const user = useUser();

  if ( !user || !user.isLoaded ) return <LoadingPage />;

  console.log(user);

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4 ">
          {!user.isSignedIn && (
            <div className="justify-center flex">
              <SignInButton />
              </div>
            )} 
            {!!user.isSignedIn && (
            <CreatePostWizzard />
            // <div className="justify-center flex">
            //   <SignOutButton />
            // </div>
            )}
          </div>
          <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
