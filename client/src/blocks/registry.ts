import { ButtonBlock, ButtonBlockSchema } from "./ButtonBlock";

export const BLOCK_REGISTRY: Record<string, { component: React.FC<any>; schema: any }> = {
  button: {
    component: ButtonBlock,
    schema: ButtonBlockSchema,
  },
};
