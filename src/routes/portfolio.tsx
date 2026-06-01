import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/features/portfolio/components/PortfolioPage";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — DEX" },
      { name: "description", content: "Track your wallet holdings, LP positions, and onchain activity in one dashboard." },
    ],
  }),
  component: PortfolioRoute,
});

function PortfolioRoute() {
  return <PortfolioPage />;
}

