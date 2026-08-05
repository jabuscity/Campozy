'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import type { Student } from '@/types'

export function StudentProfileForm({
  student,
  campuses = [],
  programs = [],
  highSchools = [],
}: {
  student: Student & { campus?: { id: string; name: string }; program?: { id: string; name: string }; former_school?: { id: string; name: string } }
  campuses: Array<{ id: string; name: string; universities?: { id: string; name: string } }>
  programs: Array<{ id: string; name: string; degree_level?: string | null }>
  highSchools: Array<{ id: string; name: string }>
}) {
  const [enrollmentYear, setEnrollmentYear] = React.useState(student.enrollment_year?.toString() || '')
  const [graduationYear, setGraduationYear] = React.useState(student.expected_graduation_year?.toString() || '')
  const [campusId, setCampusId] = React.useState(student.campus_id || '')
  const [programId, setProgramId] = React.useState(student.program_id || '')
  const [formerSchoolId, setFormerSchoolId] = React.useState(student.former_school_id || '')
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const res = await fetch('/api/profile/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollment_year: enrollmentYear ? Number(enrollmentYear) : null,
        expected_graduation_year: graduationYear ? Number(graduationYear) : null,
        campus_id: campusId || null,
        program_id: programId || null,
        former_school_id: formerSchoolId || null,
      }),
    })

    if (res.ok) {
      setMessage({ type: 'success', text: 'Student profile updated successfully.' })
    } else {
      setMessage({ type: 'error', text: 'Failed to update student profile.' })
    }

    setSaving(false)
  }

  const inputClass = 'w-full px-4 h-12 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-8">
      <h2 className="text-2xl font-black text-neutral-900 mb-1">Student Profile</h2>
      <p className="text-sm text-neutral-500 mb-8">Update your academic and housing preferences.</p>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest">
              Enrollment Year
            </label>
            <input
              type="number"
              value={enrollmentYear}
              onChange={e => setEnrollmentYear(e.target.value)}
              placeholder="e.g. 2024"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest">
              Expected Graduation Year
            </label>
            <input
              type="number"
              value={graduationYear}
              onChange={e => setGraduationYear(e.target.value)}
              placeholder="e.g. 2028"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest">
            Campus
          </label>
          <select
            value={campusId}
            onChange={e => setCampusId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a campus...</option>
            {campuses.map(campus => (
              <option key={campus.id} value={campus.id}>
                {campus.name} {campus.universities?.name ? `(${campus.universities.name})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest">
            Academic Program
          </label>
          <select
            value={programId}
            onChange={e => setProgramId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a program...</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name} {program.degree_level ? `(${program.degree_level})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest">
            Former School
          </label>
          <select
            value={formerSchoolId}
            onChange={e => setFormerSchoolId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a school...</option>
            {highSchools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
