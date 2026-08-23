import { useState } from "react";
import { readSkills, writeSkills } from "@/entities/skill/storage";
import type { SkillRecord } from "@/entities/skill/types";
import EntityPicker from "../EntityPicker";

export default function SkillStep({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const [skills, setSkills] = useState<SkillRecord[]>(readSkills);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  function addSkill(values: Record<string, string>) {
    const now = new Date().toISOString();
    const skill: SkillRecord = { id: `skill-${Date.now()}`, name: values.name.trim(), description: values.description.trim(), trigger: "", input: "", process: "", knowledge: [], outputFormat: "", tags: [], status: "confirmed", schemaVersion: 2, createdAt: now, updatedAt: now };
    const next = [skill, ...skills];
    setSkills(next);
    writeSkills(next);
    onChange([...selectedIds, skill.id]);
  }

  return (
    <div>
      <p className="text-[12px] leading-5 text-[#66686C]">이 Agent가 쓸 수 있는 능력을 고르세요. 아직 세부 내용을 안 채운 초안 Skill도 우선 연결해 둘 수 있습니다.</p>
      <div className="mt-4">
        <EntityPicker
          items={skills.map((skill) => ({ id: skill.id, label: skill.name, sublabel: skill.status === "draft" ? `초안 · ${skill.description || "설명 없음"}` : skill.description }))}
          selectedIds={selectedIds}
          onToggle={toggle}
          emptyHint="아직 등록된 Skill이 없습니다. 아래에서 바로 만들어 보세요."
          quickAddFields={[{ key: "name", placeholder: "이름 · 예: HACCP 위해평가" }, { key: "description", placeholder: "설명 · 이 Skill이 하는 일을 한 줄로" }]}
          quickAddLabel="Skill 추가"
          onQuickAdd={addSkill}
        />
      </div>
    </div>
  );
}
