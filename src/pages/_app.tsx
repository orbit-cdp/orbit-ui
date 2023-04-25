import '/public/fonts/dm-sans.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { SettingsProvider } from '../contexts';
import DefaultLayout from '../layouts/DefaultLayout';
import { useStore } from '../store/store';
import theme from '../theme';

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  const { refreshBackstopData } = useStore();
  useEffect(() => {
    refreshBackstopData();
  }, [refreshBackstopData]);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <SettingsProvider>
          <CssBaseline />
          <DefaultLayout>
            <Component {...pageProps} />
          </DefaultLayout>
        </SettingsProvider>
      </ThemeProvider>
    </>
  );
}
