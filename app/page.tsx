"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type SheepStatus = "Healthy" | "Monitoring" | "Critical";
type SheepSex = "Ewe" | "Ram" | "Lamb";

type Sheep = {
  id: number;
  name: string;
  tag: string;
  breed: string;
  sex: SheepSex;
  age: number;
  weight: number;
  status: SheepStatus;
  location: string;
  lastHealthCheck: string;
};

type TaskItem = {
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Low";
};

const statusMap: Record<string, SheepStatus> = {
  HEALTHY: "Healthy",
  MONITORING: "Monitoring",
  CRITICAL: "Critical",
};

const sexMap: Record<string, SheepSex> = {
  EWE: "Ewe",
  RAM: "Ram",
  LAMB: "Lamb",
};

const normalizeSheep = (rows: Array<Record<string, unknown>>): Sheep[] =>
  rows.map((row) => ({
    id: Number(row.id ?? Date.now()),
    name: String(row.name ?? "Unknown sheep"),
    tag: String(row.tagNumber ?? row.tag ?? "N/A"),
    breed: String(row.breed ?? "Merino"),
    sex: sexMap[String(row.sex ?? "EWE")] ?? "Ewe",
    age: Number(row.ageMonths ?? row.age ?? 12),
    weight: Number(row.weightKg ?? row.weight ?? 0),
    status: statusMap[String(row.status ?? "HEALTHY")] ?? "Healthy",
    location: String(row.location ?? "North Paddock"),
    lastHealthCheck: String(
      row.lastHealthCheck ?? new Date().toISOString().slice(0, 10)
    ).slice(0, 10),
  }));

const initialSheep: Sheep[] = [
  {
    id: 1,
    name: "Mabel",
    tag: "S-104",
    breed: "Merino",
    sex: "Ewe",
    age: 3,
    weight: 63,
    status: "Healthy",
    location: "North Paddock",
    lastHealthCheck: "2026-08-12",
  },
  {
    id: 2,
    name: "Bramble",
    tag: "S-218",
    breed: "Dorper",
    sex: "Ram",
    age: 4,
    weight: 81,
    status: "Monitoring",
    location: "Breeding Yard",
    lastHealthCheck: "2026-08-10",
  },
  {
    id: 3,
    name: "Poppy",
    tag: "S-334",
    breed: "Suffolk",
    sex: "Lamb",
    age: 1,
    weight: 29,
    status: "Healthy",
    location: "Lambing Pen",
    lastHealthCheck: "2026-08-08",
  },
  {
    id: 4,
    name: "Juniper",
    tag: "S-441",
    breed: "Merino",
    sex: "Ewe",
    age: 5,
    weight: 59,
    status: "Critical",
    location: "Recovery Barn",
    lastHealthCheck: "2026-08-06",
  },
];

const initialTasks: TaskItem[] = [
  { title: "Vaccination round", detail: "12 sheep due this week", priority: "High" },
  { title: "Pasture rotation", detail: "North paddock ready for grazing", priority: "Medium" },
  { title: "Weaning check", detail: "Review 7 lambs after feed change", priority: "Medium" },
  { title: "Shearing schedule", detail: "4 rams booked for Friday", priority: "Low" },
];

const statusStyles: Record<SheepStatus, string> = {
  Healthy: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Monitoring: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Critical: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

const emptyForm = {
  name: "",
  tag: "",
  breed: "Merino",
  sex: "Ewe" as SheepSex,
  age: "2",
  weight: "50",
  status: "Healthy" as SheepStatus,
  location: "North Paddock",
};

export default function Home() {
  const [sheep, setSheep] = useState<Sheep[]>(initialSheep);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | SheepStatus>("All");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sheepResponse, taskResponse] = await Promise.all([
          fetch("/api/sheep"),
          fetch("/api/tasks"),
        ]);

        if (sheepResponse.ok) {
          const sheepData = await sheepResponse.json();
          if (Array.isArray(sheepData) && sheepData.length > 0) {
            setSheep(normalizeSheep(sheepData));
          }
        }

        if (taskResponse.ok) {
          const taskData = await taskResponse.json();
          if (Array.isArray(taskData) && taskData.length > 0) {
            setTasks(
              taskData.map((task: Record<string, unknown>) => ({
                title: String(task.title ?? "Farm task"),
                detail: String(task.detail ?? "No details yet"),
                priority: (String(task.priority ?? "Medium") as TaskItem["priority"]),
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to load farm data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredSheep = useMemo(() => {
    return sheep.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesSearch =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.tag.toLowerCase().includes(query.toLowerCase()) ||
        item.location.toLowerCase().includes(query.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [query, sheep, statusFilter]);

  const totals = useMemo(() => {
    const healthy = sheep.filter((item) => item.status === "Healthy").length;
    const ewes = sheep.filter((item) => item.sex === "Ewe").length;
    const lambs = sheep.filter((item) => item.sex === "Lamb").length;
    const critical = sheep.filter((item) => item.status === "Critical").length;

    return { total: sheep.length, healthy, ewes, lambs, critical };
  }, [sheep]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.tag) {
      return;
    }

    const sexLookup: Record<SheepSex, "EWE" | "RAM" | "LAMB"> = {
      Ewe: "EWE",
      Ram: "RAM",
      Lamb: "LAMB",
    };

    const statusLookup: Record<SheepStatus, "HEALTHY" | "MONITORING" | "CRITICAL"> = {
      Healthy: "HEALTHY",
      Monitoring: "MONITORING",
      Critical: "CRITICAL",
    };

    const payload = {
      tagNumber: form.tag,
      name: form.name,
      breed: form.breed,
      sex: sexLookup[form.sex],
      ageMonths: Number(form.age),
      weightKg: Number(form.weight),
      status: statusLookup[form.status],
      location: form.location,
      lastHealthCheck: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/sheep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdRecord = await response.json();
        setSheep((current) => [
          {
            id: createdRecord.id,
            name: createdRecord.name,
            tag: createdRecord.tagNumber,
            breed: createdRecord.breed,
            sex: sexMap[String(createdRecord.sex)] ?? "Ewe",
            age: Number(createdRecord.ageMonths),
            weight: Number(createdRecord.weightKg ?? 0),
            status: statusMap[String(createdRecord.status)] ?? "Healthy",
            location: createdRecord.location,
            lastHealthCheck: String(createdRecord.lastHealthCheck ?? new Date().toISOString()).slice(0, 10),
          },
          ...current,
        ]);
      }
    } catch (error) {
      console.error("Failed to save sheep:", error);
    }

    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f6f7e8,_#f5f2eb_40%,_#ede6db_100%)] text-slate-800">
      <header className="border-b border-emerald-900/10 bg-white/75 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-lg font-bold text-white shadow-md shadow-emerald-700/20">
              S
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
                Shepherd OS
              </p>
              <h1 className="text-lg font-semibold text-slate-900">Farm Control Center</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#overview" className="transition hover:text-emerald-700">Overview</a>
            <a href="#flock" className="transition hover:text-emerald-700">Flock</a>
            <a href="#tasks" className="transition hover:text-emerald-700">Tasks</a>
            <a href="#reports" className="transition hover:text-emerald-700">Reports</a>
          </nav>

          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
          >
            {showForm ? "Close form" : "+ Add sheep"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Loading farm data from PostgreSQL...
          </div>
        )}

        <section id="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm shadow-slate-200/60">
            <p className="text-sm text-slate-500">Total flock</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{totals.total}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">+8% this month</span>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm shadow-slate-200/60">
            <p className="text-sm text-slate-500">Healthy sheep</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{totals.healthy}</span>
              <span className="text-xs font-medium text-emerald-600">Stable</span>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm shadow-slate-200/60">
            <p className="text-sm text-slate-500">Breeding ewes</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{totals.ewes}</span>
              <span className="text-xs font-medium text-amber-600">3 due soon</span>
            </div>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm shadow-slate-200/60">
            <p className="text-sm text-slate-500">Critical cases</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{totals.critical}</span>
              <span className="text-xs font-medium text-rose-600">Review daily</span>
            </div>
          </div>
        </section>

        {showForm && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Register new sheep</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Digital record</span>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <label className="space-y-2 text-sm font-medium text-slate-600">
                Name
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0 transition focus:border-emerald-400"
                  placeholder="Molly"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600">
                Tag ID
                <input
                  value={form.tag}
                  onChange={(event) => setForm({ ...form, tag: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0 transition focus:border-emerald-400"
                  placeholder="S-500"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600">
                Breed
                <select
                  value={form.breed}
                  onChange={(event) => setForm({ ...form, breed: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-400"
                >
                  <option>Merino</option>
                  <option>Dorper</option>
                  <option>Suffolk</option>
                  <option>Romney</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600">
                Sex
                <select
                  value={form.sex}
                  onChange={(event) => setForm({ ...form, sex: event.target.value as SheepSex })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-400"
                >
                  <option value="Ewe">Ewe</option>
                  <option value="Ram">Ram</option>
                  <option value="Lamb">Lamb</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600">
                Age (months)
                <input
                  type="number"
                  value={form.age}
                  onChange={(event) => setForm({ ...form, age: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600">
                Weight (kg)
                <input
                  type="number"
                  value={form.weight}
                  onChange={(event) => setForm({ ...form, weight: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600 md:col-span-2 xl:col-span-2">
                Paddock
                <input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600 md:col-span-2 xl:col-span-2">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as SheepStatus })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-400"
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>

              <div className="flex items-end md:col-span-2 xl:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Save record
                </button>
              </div>
            </form>
          </section>
        )}

        <section id="flock" className="grid gap-6 xl:grid-cols-[1.8fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Flock register</p>
                <h2 className="text-2xl font-bold text-slate-900">Sheep overview</h2>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tag or name"
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as "All" | SheepStatus)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
                >
                  <option value="All">All status</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-3 font-medium">Sheep</th>
                    <th className="pb-3 pr-3 font-medium">Breed</th>
                    <th className="pb-3 pr-3 font-medium">Weight</th>
                    <th className="pb-3 pr-3 font-medium">Location</th>
                    <th className="pb-3 pr-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSheep.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-none">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">Tag {item.tag}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {item.breed}
                        <span className="ml-2 text-slate-400">{item.sex}</span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{item.weight} kg</td>
                      <td className="py-3 pr-3 text-slate-600">{item.location}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside id="tasks" className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Farm tasks</h3>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">This week</span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.title} className="rounded-2xl bg-slate-50 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">{task.title}</p>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{task.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="reports" className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm shadow-emerald-100/60">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">Report</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Lambing season</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                    <span>Pregnancy checks</span>
                    <span>72%</span>
                  </div>
                  <div className="h-2 rounded-full bg-emerald-200">
                    <div className="h-2 w-[72%] rounded-full bg-emerald-600" />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                    <span>Feed efficiency</span>
                    <span>88%</span>
                  </div>
                  <div className="h-2 rounded-full bg-emerald-200">
                    <div className="h-2 w-[88%] rounded-full bg-emerald-600" />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                    <span>Health compliance</span>
                    <span>94%</span>
                  </div>
                  <div className="h-2 rounded-full bg-emerald-200">
                    <div className="h-2 w-[94%] rounded-full bg-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
