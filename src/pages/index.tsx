import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";
import { use, useState } from "react";
import { toast } from "react-hot-toast";
import { Loading, LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/page_layout";
import { PostView } from "~/components/post";

import { api } from "~/utils/api";
import Chart from "./chart";

const CreatePostWizzard = () => {

  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      // void ctx.posts.getAll.invalidate();
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

const Feed = () => {
  // const {data, isLoading} = api.posts.getAll.useQuery();

  // if ( isLoading ) return <LoadingPage />;

  // if ( !data ) return <div>Something went wrong...</div>;

  return (
    <div className="flex flex-col">
      {/* {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))} */}
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
            <Chart />
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
