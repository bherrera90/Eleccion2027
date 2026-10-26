export type SurveyContent = {
  slug: string;
  title: string;
  description: string;
  options: Array<{
    title: string;
    tag: string;
    description: string;
    imagePath: string;
  }>;
};

export const surveyContent: SurveyContent = {
  slug: "eleccion-2027",
  title: "Elección de Chompa Official Promocion 2026 - 2027",
  description:
    "Selecciona una sola imagen de la chompa que quieres. Tu voto es secreto y se registrará de forma única con tu cédula.",
  options: [
    {
      title: "Opcion 1",
      tag: "",
      description:
        "",
      imagePath: "/images/Promo20271.jpeg",
    },
    {
      title: "Opcion 2",
      tag: "",
      description:
        "",
      imagePath: "/images/Promo20272.jpeg",
    },
    {
      title: "Opcion 3",
      tag: "",
      description:
        "",
      imagePath: "/images/Promo20273.jpeg",
    },
    {
      title: "Opcion 4",
      tag: "",
      description:
        "",
      imagePath: "/images/Promo20274.jpeg",
    }
  ],
};
