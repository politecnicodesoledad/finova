import { createFileRoute } from "@tanstack/react-router";
import { FinovaApp } from "@/components/FinovaApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FINOVA • Finanzas Inteligentes para Colegios" },
      {
        name: "description",
        content: "Plataforma educativa gamificada de finanzas para niñas de 4.° y 5.°: misiones mensuales, minicursos, Caza-Monedas y El Mercadito de la Alcancía.",
      },
      { property: "og:title", content: "FINOVA • Finanzas Inteligentes para Colegios" },
      {
        property: "og:description",
        content: "Tu dinero. Tus metas. Nuestro plan. Misiones, juegos y premios para aprender a ahorrar en el colegio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <FinovaApp />;
}
