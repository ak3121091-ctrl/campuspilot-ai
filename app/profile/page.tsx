import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/dashboard/section-card";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Student account">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Student profile" description="Your account information and learning context.">
          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 font-semibold text-white">A</div>
              <div>
                <p className="text-lg font-semibold text-white">Ananya Sharma</p>
                <p>Computer Science • Semester 5</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Email: ananya@student.college.edu</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Preferred study mode: Hinglish explanations</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Current focus: DSA + OS revision</div>
          </div>
        </SectionCard>

        <SectionCard title="Security and preferences" description="Keep your account, documents, and study process protected.">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Two-factor authentication enabled</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Recommended security review before final AWS deployment</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Document sharing controls: private by default</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">AI output style: concise and student-friendly</div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
