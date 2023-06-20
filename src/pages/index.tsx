import { type NextPage } from "next";
import Head from "next/head";
import React, { Ref, useEffect, useRef, useState } from "react";
import Layout from "~/components/layouts/main.layout";
import Image from "next/image";
import { Heart, LoaderIcon, MessageSquare, Repeat } from "lucide-react";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import type { TweetData } from "~/server/api/routers/tweet";
import Link from "next/link";
import { useIntersection } from "@mantine/hooks";

const Home: NextPage = () => {
	const { data, fetchNextPage, isFetchingNextPage } =
		api.tweet.getTweetsInfinite.useInfiniteQuery(
			{ limit: 10 },
			{
				getNextPageParam: (lastpage) => {
					const lastItem = lastpage[lastpage.length - 1];
					return lastItem?.time.toISOString() || undefined;
				},
				initialCursor: new Date().toISOString(),
			}
		);
	const tweetList: TweetData[] | undefined = data?.pages.flatMap(
		(item) => item
	);

	const lastPosRef = useRef<HTMLElement>(null);
	const { ref, entry } = useIntersection({
		root: lastPosRef.current,
		threshold: 1,
	});

	useEffect(() => {
		if (entry?.isIntersecting) {
			Promise.all([fetchNextPage()]).catch((err) => console.error(err));
			return;
		}
	}, [entry, fetchNextPage]);

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
					<div
						className="min-h-10 mb-10 flex h-10 w-full justify-center"
						ref={ref}
					>
						{isFetchingNextPage ? (
							<LoaderIcon className=" animate-spin" />
						) : undefined}
					</div>
				</div>
			</Layout>
		</>
	);
};

const TweetItem = ({ data, ...props }: { data: TweetData }) => {
	const likeMutation = api.tweet.toggleLike.useMutation();
	const { user } = useUser();
	const likeQuery = api.tweet.likeState.useQuery({
		user: user?.id || "",
		tweet: data.id,
	});

	// TODO change to reducer
	const [liked, setLiked] = useState(likeQuery.data && likeQuery.data > 0);
	const [likeCount, setLikeCount] = useState(data._count.likes);

	useEffect(() => {
		setLiked(likeQuery.data && likeQuery.data > 0);
	}, [likeQuery.data]);

	const toggleLike = async () => {
		const result = await likeMutation.mutateAsync({
			user: user?.id || "",
			tweet: data.id,
		});
		setLiked(result);
		setLikeCount(result ? likeCount + 1 : likeCount - 1);
	};

	return (
		<div
			className="py-4 drop-shadow-md transition-all hover:drop-shadow-lg"
			{...props}
		>
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
					<Repeat size={20} />0
				</span>
				{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
				<Link href={"#"} onClick={toggleLike}>
					<span className="group flex items-center gap-2 text-white/70 drop-shadow-md transition-all hover:text-white group-hover:drop-shadow-lg">
						<Heart
							className={`transition-all ${
								liked
									? "text-red-600 group-hover:text-red-500"
									: "text-white/70 group-hover:text-white"
							}`}
							size={20}
						/>
						{likeCount}
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
		if (!content.length) return;

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
