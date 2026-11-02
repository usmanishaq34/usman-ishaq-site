import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import Article from "@/components/Article";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Draft preview for signed-in admins. Never cached: always the latest save.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const session = await auth();
  if (!session) notFound();
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, include: { category: true, postAuthor: true } }).catch(() => null);
  if (!post) notFound();
  return (
    <>
      <SiteHeader light />
      <main>
        <Article post={post} preview />
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
    </>
  );
}
