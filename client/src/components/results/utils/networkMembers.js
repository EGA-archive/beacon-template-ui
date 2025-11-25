import config from "../../../config/config.json";

export async function fetchNetworkMembers() {
  try {
    const response = await fetch(`${config.apiUrl}/services`);
    if (!response.ok) throw new Error("Failed to fetch network members");
    const data = await response.json();
    return data.services || [];
  } catch (error) {
    console.error("Error fetching network members:", error);
    return [];
  }
}

export async function fetchNetworkMembersWithMaturity(networkMembers) {
  const updatedMembers = await Promise.all(
    networkMembers.map(async (member) => {
      try {
        const res = await fetch(`${member.url}/configuration`);
        if (!res.ok) throw new Error(`Failed to fetch ${member.url}`);
        const data = await res.json();
        return {
          ...member,
          maturity: data.maturityAttributes?.productionStatus || "Undefined",
        };
      } catch (err) {
        console.warn(`Error fetching configuration for ${member.url}:`, err);
        return { ...member, maturity: "Undefined" };
      }
    })
  );
  return updatedMembers;
}

export async function loadNetworkMembersWithMaturity() {
  const members = await fetchNetworkMembers();
  return await fetchNetworkMembersWithMaturity(members);
}
