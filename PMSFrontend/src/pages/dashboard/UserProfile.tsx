import { ChangeEvent, FormEvent, useState } from 'react'

import { useAuth } from '../../context/AuthContext'

interface ProfileFormState {
  fullName: string
  title: string
  email: string
  phone: string
  bio: string
}

const initialProfileState: ProfileFormState = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  bio: '',
}

function UserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileFormState>(initialProfileState)
  const [saved, setSaved] = useState<boolean>(false)

  const handleChange = (field: keyof ProfileFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile((previous) => ({ ...previous, [field]: event.target.value }))
    setSaved(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">User profile</h1>
        <p className="mt-2 text-sm text-slate-500">Manage personal information and visibility for your PMS account.</p>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-2xl font-semibold text-white">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user?.username}</h2>
            <p className="text-sm uppercase tracking-wide text-slate-400">{user?.role}</p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Update your display name"
                value={profile.fullName}
                onChange={handleChange('fullName')}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="title">
                Title / role
              </label>
              <input
                id="title"
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Product Manager, UI Designer, etc."
                value={profile.title}
                onChange={handleChange('title')}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="name@company.com"
                value={profile.email}
                onChange={handleChange('email')}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Optional contact"
                value={profile.phone}
                onChange={handleChange('phone')}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Highlight your expertise and preferred working style"
              value={profile.bio}
              onChange={handleChange('bio')}
            />
          </div>

          <div className="flex items-center justify-between">
            {saved && <span className="text-sm font-semibold text-emerald-600">Profile saved!</span>}
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-md focus:outline-none focus:ring-4 focus:ring-primary-500/30"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default UserProfile
