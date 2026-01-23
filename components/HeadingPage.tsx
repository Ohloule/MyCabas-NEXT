import { ReactNode } from "react";

interface HeadingPageProps {
  title: string;
  children?: ReactNode;
}

export default function HeadingPage({ title, children }: HeadingPageProps) {
  return (
    <section className="bg-principale-500 bg-pricing text-white py-12 px-4 md:px-16 ">
      <div className="align-center text-center">
        <h1 className="text-5xl font-special font-bold mb-4">{title}</h1>
        {children}
      </div>
    </section>
  );
}
