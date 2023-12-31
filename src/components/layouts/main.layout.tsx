import {
	Bird,
	HomeIcon,
	Search,
	Bookmark,
	Settings,
	UserCircle,
	LogOut,
} from "lucide-react";
import Link from "next/link";
import type { EventHandler, MouseEventHandler, ReactNode } from "react";

type TrendType = { title: string; count: number; type: string; url: string };

const mockTrends: Array<TrendType> = [
	{ title: "Mollit sit", count: 32000, type: "music", url: "" },
	{ title: "laboris eu", count: 132000, type: "fashion", url: "" },
	{ title: "tempor commodo", count: 3000, type: "anime", url: "" },
	{ title: "laboris eu ", count: 156000, type: "movie", url: "" },
	{ title: "tempor commodo", count: 42000, type: "politic", url: "" },
	{ title: "est et", count: 32000, type: "music", url: "" },
	{ title: "adipisicing anim", count: 902000, type: "music", url: "" },
];

const Layout = ({ children }: { children?: ReactNode }) => (
	<div className="flex h-[100dvh] gap-0 bg-zinc-900 pr-4 sm:gap-4 lg:px-0">
		<div className="my-4 flex w-14 grow-0 flex-col items-center gap-4 md:items-end lg:grow">
			<Link href={`#`}>
				<span className="hidden w-full pr-1 text-4xl font-bold uppercase text-transparent text-white transition-all duration-150 hover:text-cyan-300 hover:duration-300 lg:block">
					mikado
				</span>
				<span className="block text-3xl font-bold uppercase text-transparent text-white transition-all duration-150 hover:text-cyan-300 hover:duration-300 lg:hidden">
					<Bird size={36} />
				</span>
			</Link>
			<div className="mr-0 flex flex-col items-start gap-2">
				<NavLink name="home" icon={<HomeIcon size={32} />} href="" />
				<NavLink name="search" icon={<Search size={32} />} href="" />
				<NavLink name="saved" icon={<Bookmark size={32} />} href="" />
				<NavLink name="setting" icon={<Settings size={32} />} href="" />
				<NavLink
					name="profile"
					icon={<UserCircle size={32} />}
					href=""
				/>
				<NavLink name="logout" icon={<LogOut size={32} />} href="" />
			</div>
		</div>
		<DefaultBase className="my-4 max-h-screen w-3/5 grow overflow-hidden pb-24 lg:w-1/3 lg:grow-0">
			{children}
		</DefaultBase>
		<div className="mt-4 hidden w-14 grow flex-col gap-4 lg:flex">
			<DefaultBase className="w-60 shrink p-3 focus-within:border-white/50 hover:border-zinc-600">
				<input
					type="text"
					placeholder="Search"
					className="bg-transparent outline-none placeholder:text-white/60"
				/>
			</DefaultBase>
			<DefaultBase className="mb-4 w-60 shrink grow p-2">
				<h1 className="mb-2 pl-2 text-2xl capitalize">trends</h1>
				<hr className="border-zinc-600/80" />
				<Trends />
			</DefaultBase>
		</div>
	</div>
);

export default Layout;

const Trends = () => {
	return (
		<div className="flex flex-col">
			{mockTrends.map((item, index) => (
				<TrendItem
					item={item}
					key={`trenditem-${item.title}${index}`}
				/>
			))}
		</div>
	);
};

const TrendItem = ({ item, ...props }: { item: TrendType }) => (
	<>
		<Link href={item.url}>
			<div className="group bg-transparent p-2 transition-colors hover:bg-slate-500/10 hover:saturate-100">
				<h3 className="text-xl text-white/80 transition-colors group-hover:text-white">
					{item.title}
				</h3>
				<span className="text-sm text-white/80 transition-colors group-hover:text-white">
					{Intl.NumberFormat(
						global.navigator ? navigator.language : "zh-TW",
						{
							notation: "compact",
						}
					).format(item.count)}
				</span>
			</div>
		</Link>
		<hr className="border-zinc-600/50" />
	</>
);

const NavLink = ({
	name,
	icon,
	href = "",
	onClick,
}: {
	name: string;
	icon: ReactNode;
	href?: string;
	onClick?: MouseEventHandler;
}) => (
	<Link href={href} onClick={onClick}>
		<div className="flex w-full justify-around gap-3 rounded-lg p-2 uppercase text-white transition-all duration-75 hover:bg-zinc-400/10 hover:duration-100">
			<span className="blockfont-bold">{icon}</span>
			<span className="hidden text-2xl lg:block">{name}</span>
		</div>
	</Link>
);

export const PanelBase = ({
	children,
	className,
}: {
	children?: ReactNode;
	className?: string;
}) => (
	<div
		className={`rounded-xl border-[1px] border-zinc-600/20 bg-slate-700/10 text-white ${
			className || ""
		}`}
	>
		{children}
	</div>
);

export const DefaultBase = ({
	children,
	className,
}: {
	children?: ReactNode;
	className?: string;
}) => (
	<PanelBase className={`bg-zinc-800/40 transition-all ${className || ""}`}>
		{children}
	</PanelBase>
);
