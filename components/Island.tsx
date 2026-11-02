/* Marks an interactive part of a page ("island"). The wrapper uses
   display:contents, so it never changes layout or CSS. In the dashboard's
   content, an island is stored as an empty placeholder
   <div data-dv-island="name"></div>; at render time EditableSections puts the
   live React component back in its place (components/islands.tsx). */
export default function Island({ name, attrs, children }: { name: string; attrs?: Record<string, string>; children?: React.ReactNode }) {
  return (
    <div data-dv-island={name} style={{ display: "contents" }} {...attrs}>
      {children}
    </div>
  );
}
