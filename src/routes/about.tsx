import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — DEX" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-white/90 p-6">
        <h1 className="text-2xl font-semibold">About (Demo)</h1>
        <p className="mt-3 text-sm text-muted-foreground">Demo about page for the company section.</p>
      </div>
    </div>
  );
}
