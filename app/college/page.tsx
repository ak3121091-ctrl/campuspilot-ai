import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/dashboard/section-card";

const notices = [
  { title: "OOPS practical schedule", detail: "Phase 2 practicals begin on 18th October. Submit your lab record by 9:00 AM." },
  { title: "Unit 3 syllabus", detail: "The unit covers file handling, exception management, and inheritance patterns." },
  { title: "Exam guidelines", detail: "Bring hall ticket, use blue or black ink, and refrain from carrying personal notes." },
];

export default function CollegePage() {
  return (
    <AppShell title="College Knowledge" subtitle="Approved resources only">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Approved resources" description="This content is grounded in the college documents you have approved for reference.">
          <div className="space-y-3">
            {notices.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Example queries" description="The AI answers using approved documents and says when information is missing.">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">“When is my OOPS practical?”</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">“What topics are included in Unit 3?”</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">“What documents are required for this process?”</div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
