import { FavIconAssets, ScriptAssets, StylesheetAssets } from "@keybr/assets";
import { getDir } from "@keybr/intl";
import { ThemePrefs, useTheme } from "@keybr/lnf";
import {
  isPremiumUser,
  PageDataScript,
  type PageInfo,
  Root,
  usePageData,
} from "@keybr/pages-shared";
import {
  CloudflareAnalytics,
  GoogleTagManager,
  SetupAds,
} from "@keybr/thirdparties";
import { type ReactNode } from "react";
import { useIntl } from "react-intl";
import { AltLangLinks, favIcons, Metas } from "./meta.tsx";

export function Shell({
  page,
  children,
}: {
  readonly page: PageInfo;
  readonly children?: ReactNode;
}): ReactNode {
  const { publicUser } = usePageData();
  return (
    <Html>
      <Head page={page}>
        {isPremiumUser(publicUser) || (
          <>
            <CloudflareAnalytics />
            <GoogleTagManager />
            <SetupAds>
              <ScriptAssets entrypoint="ads" />
            </SetupAds>
          </>
        )}
      </Head>
      <Body>{children}</Body>
    </Html>
  );
}

function Html({ children }: { readonly children?: ReactNode }): ReactNode {
  const { locale } = usePageData();
  const theme = useTheme();
  return (
    <html
      lang={locale}
      dir={getDir(locale)}
      prefix="og: http://ogp.me/ns#"
      {...ThemePrefs.dataAttributes(theme)}
    >
      {children}
    </html>
  );
}

function Head({
  page,
  children,
}: {
  readonly page: PageInfo;
  readonly children?: ReactNode;
}): ReactNode {
  const { formatMessage } = useIntl();
  return (
    <head>
      <meta charSet="UTF-8" />
      <title>{formatMessage(page.title)}</title>
      <StylesheetAssets entrypoint="browser" />
      <FavIconAssets links={favIcons} />
      <AltLangLinks page={page} />
      <Metas page={page} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <PageDataScript />
      <ScriptAssets entrypoint="browser" />
      {children}
    </head>
  );
}

function Body({ children }: { readonly children?: ReactNode }): ReactNode {
  return (
    <body>
      <Root>{children}</Root>
    </body>
  );
}