import '/public/fonts/dm-sans.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { SettingsProvider } from '../contexts';
import { BackstopProvider } from '../contexts/backstop';
import { NetworkProvider } from '../contexts/network';
import DefaultLayout from '../layouts/DefaultLayout';
import theme from '../theme';

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <SettingsProvider>
          <NetworkProvider>
            <BackstopProvider>
              <CssBaseline />
              <DefaultLayout>
                <Component {...pageProps} />
              </DefaultLayout>
            </BackstopProvider>
          </NetworkProvider>
        </SettingsProvider>
      </ThemeProvider>
    </>
  );
}
