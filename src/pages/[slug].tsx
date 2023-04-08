import { GetStaticProps, InferGetStaticPropsType, type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ userId: string }> = ({ userId }) => { 

  const { data } = api.profile.getUserByUserId.useQuery({
    userId
  }); 

  if ( !data ) return <div>Something went wrong...</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="bg-slate-600 h-36 relative">
          <Image src={data.profileImageUrl}
           alt={`${data.username}'s profile picture`} 
           width={128}
           height={128}
           className="-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-4 border-black bg-black"/>
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{data.username}</div>
        <div className="w-full border-b border-slate-400"></div>
      </PageLayout>
    </>
  );
};

import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/page_layout";

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
