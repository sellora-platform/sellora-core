import { Theme } from "../mockTheme";

/**
 * Merges two theme configurations.
 * server: The current state from the database.
 * client: The attempted update from the user.
 */
export const mergeThemes = (server: Theme, client: Theme): Theme => {
  const merged: Theme = structuredClone(server);

  // 1. Merge sections
  const serverSections = server.templates.home.sections;
  const clientSections = client.templates.home.sections;

  Object.keys(clientSections).forEach((id) => {
    if (!serverSections[id]) {
      // New section from client
      merged.templates.home.sections[id] = clientSections[id];
      if (!merged.templates.home.order.includes(id)) {
        merged.templates.home.order.push(id);
      }
    } else {
      // Merge existing section settings
      merged.templates.home.sections[id].settings = {
        ...serverSections[id].settings,
        ...clientSections[id].settings,
      };

      // Merge blocks
      const sBlocks = serverSections[id].blocks || {};
      const cBlocks = clientSections[id].blocks || {};
      
      Object.keys(cBlocks).forEach((bid) => {
        if (!sBlocks[bid]) {
          merged.templates.home.sections[id].blocks[bid] = cBlocks[bid];
          merged.templates.home.sections[id].block_order.push(bid);
        } else {
          merged.templates.home.sections[id].blocks[bid].settings = {
            ...sBlocks[bid].settings,
            ...cBlocks[bid].settings,
          };
        }
      });
    }
  });

  return merged;
};
