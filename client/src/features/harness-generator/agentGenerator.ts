import type { AgentRecord } from "@/entities/agent/types";
import type { ContextRecord } from "@/entities/context/types";
import type { HarnessFile, PlatformId } from "@/entities/harness/types";
import type { RuleRecord } from "@/entities/rule/types";
import type { SkillRecord } from "@/entities/skill/types";

function slugify(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "skill";
}

function renderAgentDocument(agent: AgentRecord, skills: SkillRecord[], rules: RuleRecord[], contexts: ContextRecord[], includeSkillDetails: boolean) {
  const contextBlock = contexts.length ? contexts.map((context) => `- **${context.name}**: ${context.body}`).join("\n") : "- 등록된 배경 지식이 없습니다.";
  const ruleBlock = rules.length ? rules.map((rule) => `- ${rule.statement}`).join("\n") : "- 확인하지 못한 내용은 사실로 단정하지 않고, 가정·확인 항목을 분리한다.";
  const skillBlock = skills.length
    ? skills.map((skill) => includeSkillDetails
        ? `### ${skill.name}\n${skill.description || "(설명 없음)"}\n- 사용 시점: ${skill.trigger || "정의되지 않음"}\n- 처리: ${skill.process || "정의되지 않음"}\n- 출력 형식: ${skill.outputFormat || "정의되지 않음"}`
        : `- **${skill.name}**: ${skill.description || "(설명 없음)"}`).join(includeSkillDetails ? "\n\n" : "\n")
    : "연결된 Skill이 없습니다.";

  return `# ${agent.name} · 시작 지침

> **역할**: ${agent.role}
> **목표**: ${agent.goal}
${agent.tone ? `> **톤**: ${agent.tone}\n` : ""}
## 배경 지식
${contextBlock}

## 지켜야 할 원칙
${ruleBlock}

## 연결된 Skill
${skillBlock}

## 기본 작업 순서
1. 요청의 목적·대상·제약·산출물을 한 줄로 재정의한다.
2. 누락된 핵심 정보가 있을 때만 짧게 확인한다.
3. 바로 사용할 수 있는 결과를 먼저 제공하고, 필요한 근거·주의점·다음 행동을 덧붙인다.

## 출력 형식
- 제목과 소제목으로 구조화한다.
- 표가 더 빠르게 이해되는 경우에만 Markdown 표를 사용한다.
- 별도 요청이 없으면 한국어로 답한다.
`;
}

function renderSkillFile(skill: SkillRecord) {
  return `---
name: ${slugify(skill.name)}
description: ${skill.description || skill.name}
---

# ${skill.name}

## 사용 시점
${skill.trigger || "별도로 정의되지 않았습니다. 이 Skill이 필요한 상황이면 사용하세요."}

## 입력
${skill.input || "정의되지 않음"}

## 처리
${skill.process || "정의되지 않음"}

## 필요 지식
${skill.knowledge.length ? skill.knowledge.map((item) => `- ${item}`).join("\n") : "- 없음"}

## 출력 형식
${skill.outputFormat || "정의되지 않음"}
`;
}

/**
 * Turns an Agent (plus its resolved Skills/Rules/Context) into the file(s) a given
 * platform expects. Claude Code gets its own per-skill SKILL.md under .claude/skills/
 * (matching how Claude Code actually discovers skills); every other platform -- Codex,
 * Gemini CLI, or a custom one -- gets Skill detail folded into one combined file, since
 * they don't have an established per-skill-file convention.
 */
export function generateHarnessFiles(agent: AgentRecord, allSkills: SkillRecord[], allRules: RuleRecord[], allContexts: ContextRecord[], platform: PlatformId): HarnessFile[] {
  const skills = allSkills.filter((skill) => agent.skillIds.includes(skill.id));
  const rules = allRules.filter((rule) => agent.ruleIds.includes(rule.id));
  const contexts = allContexts.filter((context) => agent.contextIds.includes(context.id));

  if (platform === "claude-code") {
    const files: HarnessFile[] = [{ filename: "CLAUDE.md", content: renderAgentDocument(agent, skills, rules, contexts, false) }];
    skills.forEach((skill) => {
      files.push({ filename: `.claude/skills/${slugify(skill.name)}/SKILL.md`, content: renderSkillFile(skill) });
    });
    return files;
  }
  if (platform === "codex") {
    return [{ filename: "AGENTS.md", content: renderAgentDocument(agent, skills, rules, contexts, true) }];
  }
  if (platform === "gemini-cli") {
    return [{ filename: "GEMINI.md", content: renderAgentDocument(agent, skills, rules, contexts, true) }];
  }
  return [{ filename: `${slugify(platform)}.md`, content: renderAgentDocument(agent, skills, rules, contexts, true) }];
}
