import { readAgents } from "@/entities/agent/storage";
import type { AgentRecord } from "@/entities/agent/types";
import { readContexts } from "@/entities/context/storage";
import { readHarnesses } from "@/entities/harness/storage";
import type { HarnessRecord } from "@/entities/harness/types";
import { readRules } from "@/entities/rule/storage";
import { readSkills } from "@/entities/skill/storage";

export type HarnessWithAgentName = HarnessRecord & { agentName: string };

export type DashboardSummary = {
  agents: { total: number; draft: number; confirmed: number };
  skills: { total: number; draft: number; confirmed: number };
  rules: number;
  contexts: number;
  harness: { generations: number; files: number; platforms: number };
  draftAgents: AgentRecord[];
  recentAgents: AgentRecord[];
  recentHarnesses: HarnessWithAgentName[];
};

export function readDashboardSummary(): DashboardSummary {
  const agents = readAgents();
  const skills = readSkills();
  const rules = readRules();
  const contexts = readContexts();
  const harnesses = readHarnesses();

  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  const draftAgents = agents.filter((agent) => agent.status === "draft");
  const draftSkills = skills.filter((skill) => skill.status === "draft");

  const recentAgents = [...agents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const recentHarnesses = [...harnesses]
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
    .slice(0, 5)
    .map((record) => ({ ...record, agentName: agentsById.get(record.agentId)?.name || "삭제된 Agent" }));

  return {
    agents: { total: agents.length, draft: draftAgents.length, confirmed: agents.length - draftAgents.length },
    skills: { total: skills.length, draft: draftSkills.length, confirmed: skills.length - draftSkills.length },
    rules: rules.length,
    contexts: contexts.length,
    harness: {
      generations: harnesses.length,
      files: harnesses.reduce((sum, record) => sum + record.files.length, 0),
      platforms: new Set(harnesses.map((record) => record.platform)).size,
    },
    draftAgents,
    recentAgents,
    recentHarnesses,
  };
}
