import { Hero, HeroSchema } from "./Hero";

export const SECTION_REGISTRY: Record<string, { component: React.FC<any>; schema: any }> = {
  hero: {
    component: Hero,
    schema: HeroSchema,
  },
};
