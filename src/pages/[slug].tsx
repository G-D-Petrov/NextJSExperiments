import { GetStaticProps, InferGetStaticPropsType, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ userId: string }> = ({ userId }) => { 

  const { data, isLoading } = api.profile.getUserByUserId.useQuery({
    userId: userId
  }); 

  if ( isLoading ) return <div>Loading...</div>;

  if ( !data ) return <div>Something went wrong...</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex justify-center h-screen">
        {data.username}
      </main>
    </>
  );
};

import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";

export const getStaticProps: GetStaticProps = async (context)  => {
  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("Slug is not a string");
  }

  const userId = slug;

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: {
      prisma,
      userId
    },
    transformer: superjson, // optional - adds superjson serialization
  });

  await ssg.profile.getUserByUserId.prefetch({ userId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userId
    },
  };
};

export const getStaticPaths = () => {

  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
