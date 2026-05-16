import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import HeroSection from "@/components/common/HeroSection";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const rightMockup = (
    <div className="relative w-full lg:scale-105 lg:origin-right">
      <div className="absolute -right-8 -top-6 w-32 h-32 bg-linear-to-br from-brand-100 to-purple-100 rounded-full blur-2xl opacity-60" />
      <div className="absolute -left-6 top-16 w-28 h-28 bg-linear-to-br from-emerald-100 to-sky-100 rounded-full blur-2xl opacity-50" />

      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-2xl shadow-black/10">
        <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-full border border-slate-200 px-4 py-1.5 text-xs text-muted-foreground max-w-xs w-full justify-center">
              envalis.com/dashboard
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 lg:p-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="hidden lg:block col-span-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">E</div>
                <span className="text-sm font-bold text-foreground">Envalis</span>
              </div>
              <div className="space-y-2">
                {["Dashboard", "Projects", "Tasks", "Team", "Settings"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${i === 0 ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-muted-foreground hover:bg-slate-50"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-500" : "bg-transparent"}`} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Task Boards</h3>
                  <p className="text-xs text-muted-foreground">Manage your projects efficiently</p>
                </div>
                <div className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">+ New Task</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { title: "To Do", count: 5, color: "bg-slate-100", dotColor: "bg-slate-400" },
                  { title: "In Progress", count: 3, color: "bg-blue-50", dotColor: "bg-blue-500" },
                  { title: "In Review", count: 2, color: "bg-amber-50", dotColor: "bg-amber-500" },
                ].map((col) => (
                  <div key={col.title} className={`rounded-xl ${col.color} p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <span className="text-xs font-semibold text-foreground">{col.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 text-muted-foreground font-medium ml-auto">{col.count}</span>
                    </div>
                    <div className="h-2 bg-white/80 rounded w-3/4" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((t) => (
                  <div key={t} className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm">
                    <div className="h-2 bg-slate-100 rounded w-4/5 mb-2" />
                    <div className="h-2 bg-slate-50 rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-5 left-6 bg-white rounded-2xl shadow-xl p-3 border border-slate-100 hidden sm:flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-sm">✓</div>
        <div>
          <div className="text-[11px] font-bold text-foreground">Task Complete</div>
          <div className="text-[10px] text-muted-foreground">Design System</div>
        </div>
      </div>

      <div className="absolute -bottom-6 right-6 bg-white rounded-2xl shadow-xl p-3 border border-slate-100 hidden sm:flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {["#6366f1", "#8b5cf6", "#ec4899"].map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-foreground">3 Active Members</span>
      </div>
    </div>
  );

  return (
    <HeroSection
      layout="split"
      badge="Design & Development"
      title={"Strategic Design & Development That Converts"}
      description={"We build high-performing websites, mobile apps, and AI solutions that help businesses grow 10x faster."}
      actions={(
        <>
          <Link to="/contact"><Button variant="gradient" className="rounded-full px-6 py-3">Start Your Project</Button></Link>
          <Link to="/portfolio"><Button variant="outline" className="rounded-full px-6 py-3">View Our Work</Button></Link>
        </>
      )}
      rightContent={rightMockup}
    />
  );
};

export default Hero;
