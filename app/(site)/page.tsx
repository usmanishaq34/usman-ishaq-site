import type { Metadata } from "next";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import EditableSections from "@/components/EditableSections";
import { editablePageMetadata } from "@/lib/site-content";

// The homepage sections are dashboard-editable (Dashboard → Homepage). Their
// defaults ship in content/pages/core--home.json; edits are read from the
// SiteContent table. Refreshed on save and at most once a minute otherwise.
export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return editablePageMetadata("/");
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <EditableSections path="/" />
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
    </>
  );
}
