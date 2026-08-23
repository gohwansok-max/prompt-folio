import type { PlatformId } from "@/entities/harness/types";
import PlatformPicker from "@/shared/ui/PlatformPicker";

export default function PlatformStep({ selected, onChange }: { selected: PlatformId[]; onChange: (next: PlatformId[]) => void }) {
  return (
    <div>
      <p className="text-[12px] leading-5 text-[#66686C]">이 Agent를 어떤 개발 환경에서 쓸지 고르세요. Harness Generator가 이 목록을 기본값으로 씁니다.</p>
      <div className="mt-4"><PlatformPicker selected={selected} onChange={onChange} /></div>
    </div>
  );
}
