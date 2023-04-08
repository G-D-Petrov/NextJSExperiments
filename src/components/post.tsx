import { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";

type PostWithUser = RouterOutputs['posts']['getAll'][number];
export const PostView = (props: PostWithUser) => {
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