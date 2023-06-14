import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps,
}: AppProps) => {
	return (
		<>
			<ClerkProvider {...pageProps}>
				<Component {...pageProps} />
			</ClerkProvider>
			<Analytics />
		</>
	);
};

export default api.withTRPC(MyApp);
