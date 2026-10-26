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
  title: "Elección Consejo Estudiantil 2026 - 2027",
  description:
    "Selecciona una sola lista o candidato. Tu voto es secreto y se registrará de forma única con tu cédula.",
  options: [
    {
      title: "Amanecer",
      tag: "Naturaleza",
      description:
        "Luz suave, aire fresco y el comienzo tranquilo de un día nuevo.",
      imagePath: "/images/option-1.svg",
    },
    {
      title: "Bosque",
      tag: "Aventura",
      description:
        "Senderos entre árboles, sonido de hojas y una dosis de exploración.",
      imagePath: "/images/option-2.svg",
    },
    {
      title: "Océano",
      tag: "Calma",
      description:
        "Horizonte abierto, brisa salada y el ritmo lento de las olas.",
      imagePath: "/images/option-3.svg",
    },
    {
      title: "Ciudad",
      tag: "Energía",
      description:
        "Luces, movimiento y la sensación de que todo está por pasar.",
      imagePath: "/images/option-4.svg",
    },
    {
      title: "Desierto",
      tag: "Misterio",
      description:
        "Silencio amplio, dunas doradas y un cielo que parece infinito.",
      imagePath: "/images/option-5.svg",
    },
    {
      title: "Nieve",
      tag: "Frescura",
      description:
        "Aire frío, paisaje blanco y la quietud de un lugar detenido.",
      imagePath: "/images/option-6.svg",
    },
  ],
};
