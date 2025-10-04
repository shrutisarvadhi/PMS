interface MetricCard {
  title: string
  value: number
  change: string
  trend: 'up' | 'down'
}

interface ProjectSummary {
  name: string
  owner: string
  status: string
  due: string
}

interface TaskSummary {
  task: string
  assignee: string
  due: string
  progress: number
}

interface TimesheetSummary {
  name: string
  weekEnding: string
  hours: number
  status: 'Pending' | 'Approved'
}

interface TimelogSummary {
  project: string
  description: string
  duration: string
  loggedBy: string
}

const metrics: MetricCard[] = [
  { title: 'Active Projects', value: 12, change: '+3 this month', trend: 'up' },
  { title: 'Tasks In Progress', value: 87, change: '+12 vs last week', trend: 'up' },
  { title: 'Pending Approvals', value: 5, change: '-2 vs last week', trend: 'down' },
  { title: 'Billable Hours', value: 312, change: '+18 hours', trend: 'up' },
]

const projectPipeline: ProjectSummary[] = [
  { name: 'Website Rebrand', owner: 'Sarah K.', status: 'In Discovery', due: 'Apr 12' },
  { name: 'Mobile App Launch', owner: 'Jacob M.', status: 'In Development', due: 'Apr 22' },
  { name: 'Internal CRM', owner: 'Angela P.', status: 'Awaiting QA', due: 'May 2' },
]

const taskBoard: TaskSummary[] = [
  { task: 'Design sprint retro', assignee: 'Olivia', due: 'Apr 02', progress: 80 },
  { task: 'API contract review', assignee: 'Daniel', due: 'Apr 05', progress: 45 },
  { task: 'Client kickoff deck', assignee: 'Priya', due: 'Mar 31', progress: 100 },
  { task: 'Timesheet audit', assignee: 'Leo', due: 'Apr 04', progress: 60 },
]

const timesheetApprovals: TimesheetSummary[] = [
  { name: 'Emma Stone', weekEnding: 'Mar 29', hours: 40, status: 'Pending' },
  { name: 'Samuel Green', weekEnding: 'Mar 29', hours: 38, status: 'Approved' },
  { name: 'Noah Davis', weekEnding: 'Mar 29', hours: 42, status: 'Pending' },
]

const timelogActivity: TimelogSummary[] = [
  { project: 'Website Rebrand', description: 'Design QA fixes', duration: '2h 30m', loggedBy: 'Olivia' },
  { project: 'Internal CRM', description: 'API integration', duration: '3h 15m', loggedBy: 'Noah' },
  { project: 'Mobile App Launch', description: 'Sprint planning', duration: '1h 45m', loggedBy: 'Priya' },
]

function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.title}
            className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur transition hover:shadow-lg"
          >
            <p className="text-sm font-medium text-slate-500">{metric.title}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
            <p
              className={`mt-2 text-sm font-medium ${
                metric.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {metric.change}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Project pipeline</h2>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-500">View all</button>
          </div>
          <table className="mt-4 w-full table-fixed text-left text-sm text-slate-600">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3">Project</th>
                <th className="pb-3">Owner</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {projectPipeline.map((project) => (
                <tr key={project.name} className="transition hover:bg-slate-50/80">
                  <td className="py-3 font-medium text-slate-800">{project.name}</td>
                  <td className="py-3">{project.owner}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-primary-500/10 px-2 py-1 text-xs font-semibold text-primary-600">
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-700">{project.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Task activity</h2>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-500">View board</button>
          </div>
          <ul className="mt-4 space-y-4">
            {taskBoard.map((task) => (
              <li key={task.task} className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{task.task}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Due {task.due}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                  <span>Assigned to {task.assignee}</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${task.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Create quick project</h2>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Project CRUD</span>
          </div>
          <form className="mt-4 grid gap-4" action="#" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="project-name">
                Project name
              </label>
              <input
                id="project-name"
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Enter a project title"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="project-owner">
                Owner
              </label>
              <input
                id="project-owner"
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Assign a project owner"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="project-due">
                Due date
              </label>
              <input
                id="project-due"
                type="date"
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500/30"
              >
                Save draft
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Timesheet approvals</h2>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Timesheet</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {timesheetApprovals.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-800">{entry.name}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Week ending {entry.weekEnding}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-700">{entry.hours}h</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        entry.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent timelog activity</h2>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Timelog</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {timelogActivity.map((entry) => (
                <li key={`${entry.project}-${entry.loggedBy}`} className="rounded-2xl border border-slate-200/60 bg-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{entry.project}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Logged by {entry.loggedBy}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{entry.duration}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{entry.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
