import "./globals.css";
import Header from "./_components/Header";

export const metadata = {
  title: "Blog",
  description: "Blog built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
