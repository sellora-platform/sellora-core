import { ENV } from "./env";

const VERCEL_TOKEN = ENV.vercelToken;
const VERCEL_PROJECT_ID = ENV.vercelProjectId;
const VERCEL_TEAM_ID = ENV.vercelTeamId;

export async function addDomainToVercel(domain: string) {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn("Vercel credentials missing. Skipping domain registration.");
    return;
  }

  try {
    const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains${
      VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""
    }`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    });

    if (!response.ok) {
      const data = await response.json();
      if (response.status === 409) {
        console.log(`Domain ${domain} already exists on Vercel project.`);
        return;
      }
      throw new Error(data.error?.message || "Failed to add domain to Vercel");
    }

    console.log(`Successfully added domain ${domain} to Vercel.`);
  } catch (error: any) {
    console.error("Error adding domain to Vercel:", error.message);
  }
}

export async function removeDomainFromVercel(domain: string) {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) return;

  try {
    const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}${
      VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""
    }`;
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error?.message || "Failed to remove domain from Vercel");
    }

    console.log(`Successfully removed domain ${domain} from Vercel.`);
  } catch (error: any) {
    console.error("Error removing domain from Vercel:", error.message);
  }
}

