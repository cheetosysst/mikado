import { type NextPage } from "next";
import Head from "next/head";
import React, { useRef } from "react";
import Layout from "~/components/layouts/main.layout";
import Image from "next/image";
import { Heart, MessageSquare, Repeat } from "lucide-react";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import type { TweetData } from "~/server/api/routers/tweet";
import Link from "next/link";

const Home: NextPage = () => {
	const tweetList: TweetData[] | undefined = api.tweet.getTweets.useQuery(
		{}
	).data;

	return (
		<>
			<Head>
				<title>mikado</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Layout>
				<Composer />
				<hr className="border-white/50" />
				<div className="flex max-h-full flex-col overflow-x-hidden overflow-y-scroll scroll-smooth">
					{tweetList &&
						tweetList?.map((item, index) => (
							<TweetItem
								data={item}
								key={`post-${item.id}-${index}`}
							/>
						))}
				</div>
			</Layout>
		</>
	);
};

const TweetItem = ({ data }: { data: TweetData }) => {
	const likeMutation = api.tweet.toggleLike.useMutation();

	const toggleLike = () => {
		likeMutation.mutate({
			user: data.user,
			tweet: data.id,
		});
	};

	return (
		<div className="py-4 drop-shadow-md transition-all hover:drop-shadow-lg">
			<div className="flex gap-2 px-6">
				<div className="shrink-0 ">
					<Image
						src={data.avatar || `/user.jpg`}
						width={42}
						height={42}
						className="rounded-full drop-shadow-md"
						alt="user avatar"
					/>
				</div>
				<div className="flex grow flex-col">
					<span className="text-semibold my-1 text-xl text-white drop-shadow-sm">
						@ {data.user}
					</span>
					<div className="text-white drop-shadow-md">
						{data.content?.content}
					</div>
				</div>
			</div>
			<div className="mt-2 flex flex-row justify-around">
				<span className="flex items-center gap-2 text-white/70 drop-shadow-md transition-all hover:text-white hover:drop-shadow-lg">
					<MessageSquare size={20} />
					{data._count.children}
				</span>
				<span className="flex items-center gap-2 text-white/70 drop-shadow-md transition-all hover:text-white hover:drop-shadow-lg">
					<Repeat size={20} />
					{/* {data.repostCount} */}0
				</span>
				<Link href={"#"} onClick={toggleLike}>
					<span className="group flex items-center gap-2 text-white/70 drop-shadow-md transition-all hover:text-white group-hover:drop-shadow-lg">
						<Heart
							className={`transition-all ${
								data.likes.length
									? "text-red-600 group-hover:text-red-500"
									: "text-white/70 group-hover:text-white"
							}`}
							size={20}
						/>
						{data._count.likes}
					</span>
				</Link>
			</div>
		</div>
	);
};

const Composer = () => {
	const ref = useRef<HTMLDivElement>(null);
	const { isLoaded, isSignedIn, user } = useUser();
	const tweetMutation = api.tweet.newPost.useMutation();

	const focusHandler = () => {
		setTimeout(() => {
			if (ref.current) ref.current.focus();
		}, 0);
	};

	const submitPost = () => {
		if (!isLoaded || !isSignedIn || ref.current?.innerText === undefined)
			return;

		const content = ref.current.innerText;

		tweetMutation.mutate({
			user: user.id,
			content: content,
		});

		ref.current.innerText = "";

		return;
	};

	return (
		<div className="h-min-40 group flex flex-col p-4 transition-all hover:bg-white/20">
			<div
				contentEditable
				placeholder="New Post"
				className="w-full grow outline-none"
				ref={ref}
			></div>
			<div className="shirnk-0 cursor-text" onClick={focusHandler}>
				<button
					onClick={submitPost}
					className="float-right rounded-lg bg-white/50 p-2 capitalize text-black/40 drop-shadow-lg transition-all hover:bg-white/80 hover:text-black/60 hover:drop-shadow-xl group-focus-within:bg-white/70 group-focus-within:text-black/60"
				>
					post
				</button>
			</div>
		</div>
	);
};

export default Home;
