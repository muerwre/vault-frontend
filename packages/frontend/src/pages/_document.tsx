import Document, { Head, Html, Main, NextScript } from 'next/document';

import { getPageTitle } from '~/utils/ssr/getPageTitle';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head title={getPageTitle()}>
          <meta charSet="utf-8" />
          <meta httpEquiv="content-language" content="ru" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="theme-color" content="#222222" />

          <link
            href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700,800&display=swap&subset=cyrillic"
            rel="stylesheet"
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
