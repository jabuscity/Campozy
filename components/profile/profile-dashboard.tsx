'use client'

import * as React from 'react'
import { User, ShieldCheck, GraduationCap, Mail, Phone, MapPin, Edit3, Save, X, Camera, AlertTriangle, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { updateProfile, signOut } from '@/app/actions/auth-actions'
import { updateAvatar } from '@/app/actions/profile-actions'
import { ReportForm } from '@/components/report-form'
import { PostsTab, type PostsData } from '@/components/profile/posts-tab'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Tab = 'overview' | 'posts' | 'reports'

export function ProfileDashboard({
  profile,
  userId,
  posts,
}: {
  profile: Record<string, unknown>
  userId: string
  posts?: PostsData
}) {
  const router = useRouter()
  const [editingField, setEditingField] = React.useState<string | null>(null)
  const [tempValue, setTempValue] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [avatarMessage, setAvatarMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<Tab>('overview')
  const [isStudentModalOpen, setIsStudentModalOpen] = React.useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false)
  const [studentOptions, setStudentOptions] = React.useState<{ campuses: unknown[]; programs: unknown[]; highSchools: unknown[] } | null>(null)
  const [studentForm, setStudentForm] = React.useState({
    enrollmentMonth: '',
    enrollmentYear: '',
    graduationMonth: '',
    graduationYear: '',
    campus: '',
    program: '',
    formerSchool: '',
  })
  const [studentSuggestionQuery, setStudentSuggestionQuery] = React.useState('')
  const [studentSuggestionField, setStudentSuggestionField] = React.useState<'campus' | 'program' | 'formerSchool' | null>(null)
  const [studentSaving, setStudentSaving] = React.useState(false)
  const [studentMessage, setStudentMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordForm, setPasswordForm] = React.useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordMessage, setPasswordMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const fullName = profile && typeof profile === 'object' && 'full_name' in profile ? String((profile as Record<string, unknown>).full_name || '') : ''
  const username = profile && typeof profile === 'object' && 'username' in profile ? String((profile as Record<string, unknown>).username || '') : ''
  const bio = profile && typeof profile === 'object' && 'bio' in profile ? String((profile as Record<string, unknown>).bio || '') : ''
  const phoneNumber = profile && typeof profile === 'object' && 'phone_number' in profile ? String((profile as Record<string, unknown>).phone_number || '') : ''
  const avatarUrl = profile && typeof profile === 'object' && 'avatar_url' in profile ? String((profile as Record<string, unknown>).avatar_url || '') : ''
  const isVerified = profile && typeof profile === 'object' && 'is_verified' in profile ? Boolean((profile as Record<string, unknown>).is_verified) : false
  const campus = (profile as Record<string, unknown>)?.campus as Record<string, unknown> | undefined
  const university = (profile as Record<string, unknown>)?.university as Record<string, unknown> | undefined
  const roles = ((profile as Record<string, unknown>)?.user_roles as Array<{ roles?: Record<string, unknown> }> | undefined) || []
  const roleNames = roles
    .map(r => r.roles?.name)
    .filter((name): name is string => !!name)

  const openEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }

  const saveEdit = async () => {
    if (!editingField) return
    setSaving(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('fullName', editingField === 'fullName' ? tempValue : fullName)
    formData.append('username', editingField === 'username' ? tempValue : username)
    formData.append('bio', editingField === 'bio' ? tempValue : bio)
    formData.append('phoneNumber', editingField === 'phoneNumber' ? tempValue : phoneNumber)
    formData.append('avatarUrl', editingField === 'avatarUrl' ? tempValue : avatarUrl)

    const result = await updateProfile(formData)

    if (result && 'success' in result && result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      setEditingField(null)
      setTempValue('')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: (result as { success: false; error: string } | undefined)?.error || 'Failed to update profile.' })
    }

    setSaving(false)
  }

  const openStudentModal = async () => {
    setStudentMessage(null)
    if (!studentOptions) {
      const supabase = await createClient()
      const [campusesRes, programsRes, highSchoolsRes] = await Promise.all([
        supabase.from('campuses').select('id, name, universities(id, name)').order('name'),
        supabase.from('academic_programs').select('id, name, degree_level').order('name'),
        supabase.from('high_schools').select('id, name').order('name'),
      ])
      setStudentOptions({
        campuses: campusesRes.data || [],
        programs: programsRes.data || [],
        highSchools: highSchoolsRes.data || [],
      })
    }
    const student = (profile as Record<string, unknown>)?.students as Record<string, unknown> | undefined
    const enrollDate = student?.enrollment_date as string | undefined
    const gradDate = student?.expected_graduation_date as string | undefined
    setStudentForm({
      enrollmentMonth: enrollDate ? String(new Date(enrollDate).getMonth() + 1).padStart(2, '0') : '',
      enrollmentYear: enrollDate ? String(new Date(enrollDate).getFullYear()).slice(2) : '',
      graduationMonth: gradDate ? String(new Date(gradDate).getMonth() + 1).padStart(2, '0') : '',
      graduationYear: gradDate ? String(new Date(gradDate).getFullYear()).slice(2) : '',
      campus: (student?.campus as Record<string, unknown>)?.name?.toString() ?? '',
      program: (student?.program as Record<string, unknown>)?.name?.toString() ?? '',
      formerSchool: (student?.former_school as Record<string, unknown>)?.name?.toString() ?? '',
    })
    setIsStudentModalOpen(true)
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStudentSaving(true)
    setStudentMessage(null)

    const isValidMonth = (month: string): boolean => {
      if (!month) return false
      const n = parseInt(month, 10)
      return n >= 1 && n <= 12
    }

    if (!isValidMonth(studentForm.enrollmentMonth) || !isValidMonth(studentForm.graduationMonth)) {
      setStudentMessage({ type: 'error', text: 'Please enter valid months (01â€“12).' })
      setStudentSaving(false)
      return
    }

    if (studentForm.enrollmentYear && studentForm.graduationYear && parseInt(studentForm.graduationYear, 10) <= parseInt(studentForm.enrollmentYear, 10)) {
      setStudentMessage({ type: 'error', text: 'Graduation year must be later than enrollment year.' })
      setStudentSaving(false)
      return
    }

    const combineMonthYear = (month: string, year: string): number | null => {
      if (!month || !year) return null
      const fullYear = 2000 + Number(year)
      const date = new Date(fullYear, Number(month) - 1, 1)
      return date.getFullYear()
    }

    const res = await fetch('/api/profile/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollment_year: combineMonthYear(studentForm.enrollmentMonth, studentForm.enrollmentYear),
        expected_graduation_year: combineMonthYear(studentForm.graduationMonth, studentForm.graduationYear),
        campus: studentForm.campus || null,
        program: studentForm.program || null,
        former_school: studentForm.formerSchool || null,
      }),
    })

    if (res.ok) {
      setStudentMessage({ type: 'success', text: 'Saved' })
      setTimeout(() => {
        setIsStudentModalOpen(false)
        setStudentMessage(null)
        router.refresh()
      }, 800)
    } else {
      setStudentMessage({ type: 'error', text: 'Failed to update student profile.' })
    }

    setStudentSaving(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const MAX_AVATAR_DIMENSION = 512
  const AVATAR_QUALITY = 0.8

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new window.Image()
        img.onload = () => {
          let { width, height } = img
          if (width > MAX_AVATAR_DIMENSION || height > MAX_AVATAR_DIMENSION) {
            const ratio = Math.min(MAX_AVATAR_DIMENSION / width, MAX_AVATAR_DIMENSION / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            'image/jpeg',
            AVATAR_QUALITY
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = event.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setAvatarMessage(null)

    try {
      const compressedBlob = await compressImage(file)
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
        type: 'image/jpeg',
      })

      const formData = new FormData()
      formData.append('avatar', compressedFile)

      const result = await updateAvatar(formData)

      if (result && 'success' in result && result.success) {
        setAvatarMessage({ type: 'success', text: 'Avatar updated successfully.' })
        router.refresh()
      } else {
        setAvatarMessage({ type: 'error', text: (result as { success: false; error: string } | undefined)?.error || 'Failed to upload avatar.' })
      }
    } catch {
      setAvatarMessage({ type: 'error', text: 'Failed to process image.' })
    }

    setIsUploading(false)
  }

  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const inputClass = "w-full px-4 h-12 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <User className="h-4 w-4" /> },
    { key: 'posts', label: 'Posts', icon: <ListChecks className="h-4 w-4" /> },
    { key: 'reports', label: 'Report', icon: <AlertTriangle className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-center">
        <nav className="flex flex-wrap md:inline-flex md:flex-nowrap justify-center gap-1 p-1 bg-blue-100 rounded-3xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2.5 md:px-6 md:py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? tab.key === 'reports'
                    ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                    : 'bg-primary text-white shadow-sm hover:bg-primary/90'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-2xl mx-auto pt-6 md:pt-8 pb-4">
        {activeTab === 'overview' && (
          <div>
            <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center mb-6">
              <div className="h-24 w-24 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto mb-4 overflow-hidden relative cursor-pointer group" onClick={handleAvatarClick}>
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized priority />
                ) : (
                  <User className="h-10 w-10 text-neutral-400" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              {isUploading && (
                <p className="text-xs text-neutral-500 mb-2">Uploading...</p>
              )}
              {avatarMessage && (
                <p className={`text-xs mb-2 ${avatarMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {avatarMessage.text}
                </p>
              )}
              <h2 className="text-2xl font-black text-neutral-900">
                {fullName || 'User'}
              </h2>
              <p className="text-neutral-500 text-sm mt-1">@{username || userId.slice(0, 8)}</p>

              {roleNames.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  {roleNames.map(role => (
                    <span key={role} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-primary/10 text-primary">
                      {role}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-neutral-500">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <span>{isVerified ? 'Verified' : 'Unverified'}</span>
              </div>

              {(campus || university) && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-neutral-500">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span>{String(campus?.name || '')}{String(campus?.name && university?.name ? ' "  ' : '')}{String(university?.name || '')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                  Account Overview
                </h3>
                <p className="text-sm text-neutral-500 mt-1">Manage your personal information and preferences.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 group">
                <User className="h-5 w-5 text-primary flex-shrink-0" />
                {editingField === 'fullName' ? (
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 mb-1">Full Name</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className={inputClass}
                        placeholder="Your full name"
                      />
                      <button type="button" onClick={cancelEdit} className="flex-shrink-0">
                        <X className="h-4 w-4 text-neutral-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900">Full Name</p>
                      <p className="text-sm text-neutral-500">{fullName || 'Not set'}</p>
                    </div>
                    <button type="button" onClick={() => openEdit('fullName', fullName)} className="flex-shrink-0">
                      <Edit3 className="h-4 w-4 text-neutral-400" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 group">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                {editingField === 'username' ? (
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 mb-1">Username</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className={inputClass}
                        placeholder="@username"
                      />
                      <button type="button" onClick={cancelEdit} className="flex-shrink-0">
                        <X className="h-4 w-4 text-neutral-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900">Username</p>
                      <p className="text-sm text-neutral-500">@{username || 'Not set'}</p>
                    </div>
                    <button type="button" onClick={() => openEdit('username', username)} className="flex-shrink-0">
                      <Edit3 className="h-4 w-4 text-neutral-400" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 group">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                {editingField === 'phoneNumber' ? (
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className={inputClass}
                        placeholder="+254 700 000000"
                      />
                      <button type="button" onClick={cancelEdit} className="flex-shrink-0">
                        <X className="h-4 w-4 text-neutral-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900">Phone</p>
                      <p className="text-sm text-neutral-500">{phoneNumber || 'Not set'}</p>
                    </div>
                    <button type="button" onClick={() => openEdit('phoneNumber', phoneNumber)} className="flex-shrink-0">
                      <Edit3 className="h-4 w-4 text-neutral-400" />
                    </button>
                  </>
                )}
              </div>

               <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 group">
                 <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
                 <div className="flex-1">
                   <p className="font-bold text-neutral-900">Student Profile</p>
                   <p className="text-sm text-neutral-500">Manage your academic and housing preferences.</p>
                 </div>
                 <button type="button" onClick={openStudentModal} className="flex-shrink-0">
                   <Edit3 className="h-4 w-4 text-neutral-400" />
                 </button>
               </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 group">
                  <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">Password</p>
                    <p className="text-sm text-neutral-500">Change your account password.</p>
                  </div>
                  <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="flex-shrink-0">
                    <Edit3 className="h-4 w-4 text-neutral-400" />
                  </button>
                </div>
              {editingField ? (
                <div className="flex items-center gap-3 mt-6">
                  <Button type="button" onClick={saveEdit} disabled={saving} className="flex-1 gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <form action={signOut} className="mt-6">
                  <Button type="submit" variant="danger" className="w-full gap-2">
                    <X className="h-4 w-4" />
                    Log Out
                  </Button>
                </form>
              )}
            </div>

            <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
              <form onSubmit={async (e) => {
                e.preventDefault()
                setPasswordMessage(null)
                if (passwordForm.newPassword.length < 8) {
                  setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' })
                  return
                }
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  setPasswordMessage({ type: 'error', text: 'New passwords do not match.' })
                  return
                }
                const supabase = await createClient()
                const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
                if (error) {
                  setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password.' })
                } else {
                  setPasswordMessage({ type: 'success', text: 'Password updated successfully.' })
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
                  setTimeout(() => {
                    setIsPasswordModalOpen(false)
                    setPasswordMessage(null)
                  }, 800)
                }
              }} className="space-y-4">
                {passwordMessage && (
                  <p className={`text-xs font-medium ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordMessage.text}
                  </p>
                )}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-600">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-600">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min. 8 characters with letters and numbers"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-600">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className={inputClass}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  Update Password
                </Button>
              </form>
            </Modal>

            <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title="Edit Student Profile">
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Enroll Month</label>
                    <input
                      type="number"
                      value={studentForm.enrollmentMonth}
                      onChange={e => setStudentForm({ ...studentForm, enrollmentMonth: e.target.value })}
                      onBlur={() => {
                        const v = studentForm.enrollmentMonth
                        if (v && (parseInt(v, 10) < 1 || parseInt(v, 10) > 12)) {
                          setStudentForm({ ...studentForm, enrollmentMonth: '' })
                        }
                      }}
                      placeholder="e.g., 01"
                      min={1}
                      max={12}
                      className={`w-full px-3 h-10 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        studentForm.enrollmentMonth && (parseInt(studentForm.enrollmentMonth, 10) < 1 || parseInt(studentForm.enrollmentMonth, 10) > 12)
                          ? 'border-red-400 bg-red-50 ring-2 ring-red-200'
                          : 'border-neutral-200 bg-neutral-50'
                      }`}
                    />
                    {studentForm.enrollmentMonth && (parseInt(studentForm.enrollmentMonth, 10) < 1 || parseInt(studentForm.enrollmentMonth, 10) > 12) && (
                      <p className="text-[10px] font-medium text-red-600">Enter a month between 01â€“12</p>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Enroll Year</label>
                    <input
                      type="number"
                      value={studentForm.enrollmentYear}
                      onChange={e => setStudentForm({ ...studentForm, enrollmentYear: e.target.value })}
                      placeholder="e.g. 2024"
                      min={1900}
                      max={2100}
                      className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Graduation Month</label>
                    <input
                      type="number"
                      value={studentForm.graduationMonth}
                      onChange={e => setStudentForm({ ...studentForm, graduationMonth: e.target.value })}
                      onBlur={() => {
                        const v = studentForm.graduationMonth
                        if (v && (parseInt(v, 10) < 1 || parseInt(v, 10) > 12)) {
                          setStudentForm({ ...studentForm, graduationMonth: '' })
                        }
                      }}
                      placeholder="e.g., 01"
                      min={1}
                      max={12}
                      className={`w-full px-3 h-10 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        studentForm.graduationMonth && (parseInt(studentForm.graduationMonth, 10) < 1 || parseInt(studentForm.graduationMonth, 10) > 12)
                          ? 'border-red-400 bg-red-50 ring-2 ring-red-200'
                          : 'border-neutral-200 bg-neutral-50'
                      }`}
                    />
                    {studentForm.graduationMonth && (parseInt(studentForm.graduationMonth, 10) < 1 || parseInt(studentForm.graduationMonth, 10) > 12) && (
                      <p className="text-[10px] font-medium text-red-600">Enter a month between 01â€“12</p>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Graduation Year</label>
                    <input
                      type="number"
                      value={studentForm.graduationYear}
                      onChange={e => setStudentForm({ ...studentForm, graduationYear: e.target.value })}
                      placeholder="e.g. 2027"
                      min={1900}
                      max={2100}
                      className={`w-full px-3 h-10 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        studentForm.graduationYear && studentForm.enrollmentYear && parseInt(studentForm.graduationYear, 10) <= parseInt(studentForm.enrollmentYear, 10)
                          ? 'border-red-400 bg-red-50 ring-2 ring-red-200'
                          : 'border-neutral-200 bg-neutral-50'
                      }`}
                    />
                    {studentForm.graduationYear && studentForm.enrollmentYear && parseInt(studentForm.graduationYear, 10) <= parseInt(studentForm.enrollmentYear, 10) && (
                      <p className="text-[10px] font-medium text-red-600">Must be later than enrollment year</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Campus</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentForm.campus}
                      onChange={e => {
                        setStudentForm({ ...studentForm, campus: e.target.value })
                        setStudentSuggestionQuery(e.target.value)
                        setStudentSuggestionField('campus')
                      }}
                      onFocus={() => { setStudentSuggestionQuery(studentForm.campus); setStudentSuggestionField('campus') }}
                      onBlur={() => setTimeout(() => setStudentSuggestionField(null), 200)}
                      placeholder="Type or select a campus..."
                      className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {studentSuggestionField === 'campus' && studentSuggestionQuery && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {(studentOptions?.campuses || [])
                          .filter((campus: unknown) => {
                            const c = campus as { name: string }
                            return c.name.toLowerCase().includes(studentSuggestionQuery.toLowerCase())
                          })
                          .map((campus: unknown) => {
                            const c = campus as { id: string; name: string; universities?: { name: string } }
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onMouseDown={e => { e.preventDefault(); setStudentForm({ ...studentForm, campus: c.name }); setStudentSuggestionField(null) }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
                              >
                                {c.name} {c.universities?.name ? `(${c.universities.name})` : ''}
                              </button>
                            )
                          })}
                        {(studentOptions?.campuses || []).filter((campus: unknown) => {
                          const c = campus as { name: string }
                          return c.name.toLowerCase().includes(studentSuggestionQuery.toLowerCase())
                        }).length === 0 && (
                          <p className="px-3 py-2 text-sm text-neutral-400">No matching campus</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Academic Program</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentForm.program}
                      onChange={e => {
                        setStudentForm({ ...studentForm, program: e.target.value })
                        setStudentSuggestionQuery(e.target.value)
                        setStudentSuggestionField('program')
                      }}
                      onFocus={() => { setStudentSuggestionQuery(studentForm.program); setStudentSuggestionField('program') }}
                      onBlur={() => setTimeout(() => setStudentSuggestionField(null), 200)}
                      placeholder="Type or select a program..."
                      className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {studentSuggestionField === 'program' && studentSuggestionQuery && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {(studentOptions?.programs || [])
                          .filter((program: unknown) => {
                            const p = program as { name: string }
                            return p.name.toLowerCase().includes(studentSuggestionQuery.toLowerCase())
                          })
                          .map((program: unknown) => {
                            const p = program as { id: string; name: string; degree_level?: string | null }
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onMouseDown={e => { e.preventDefault(); setStudentForm({ ...studentForm, program: p.name }); setStudentSuggestionField(null) }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
                              >
                                {p.name} {p.degree_level ? `(${p.degree_level})` : ''}
                              </button>
                            )
                          })}
                        {(studentOptions?.programs || []).filter((program: unknown) => {
                          const p = program as { name: string }
                          return p.name.toLowerCase().includes(studentSuggestionQuery.toLowerCase())
                        }).length === 0 && (
                          <p className="px-3 py-2 text-sm text-neutral-400">No matching program</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Former School</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentForm.formerSchool}
                      onChange={e => {
                        setStudentForm({ ...studentForm, formerSchool: e.target.value })
                        setStudentSuggestionQuery(e.target.value)
                        setStudentSuggestionField('formerSchool')
                      }}
                      onFocus={() => { setStudentSuggestionQuery(studentForm.formerSchool); setStudentSuggestionField('formerSchool') }}
                      onBlur={() => setTimeout(() => setStudentSuggestionField(null), 200)}
                      placeholder="Type or select a school..."
                      className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {studentSuggestionField === 'formerSchool' && studentSuggestionQuery && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {(studentOptions?.highSchools || [])
                          .filter((school: unknown) => {
                            const s = school as { name: string }
                            return s.name.toLowerCase().includes(studentSuggestionQuery.toLowerCase())
                          })
                          .map((school: unknown) => {
                            const s = school as { id: string; name: string }
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onMouseDown={e => { e.preventDefault(); setStudentForm({ ...studentForm, formerSchool: s.name }); setStudentSuggestionField(null) }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
                              >
                                {s.name}
                              </button>
                            )
                          })}
                        {(studentOptions?.highSchools || []).filter((school: unknown) => {
                          const s = school as { name: string }
                          return s.name.toLowerCase().includes(studentSuggestionQuery.toLowerCase())
                        }).length === 0 && (
                          <p className="px-3 py-2 text-sm text-neutral-400">No matching school</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {studentMessage && (
                  <p className={`text-xs font-medium ${studentMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {studentMessage.text}
                  </p>
                )}
                <Button type="submit" disabled={studentSaving} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  {studentSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Modal>
          </div>
        )}
        {activeTab === 'posts' && posts && (
          <div className="max-w-2xl mx-auto pt-6 md:pt-8 pb-4">
            <div className="mb-6">
              <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                Posts
              </h3>
              <p className="text-sm text-neutral-500 mt-1">Your tips, opportunities, and community activity.</p>
            </div>
            <PostsTab data={posts} />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="max-w-2xl mx-auto pt-6 md:pt-8 pb-4">
            <div className="mb-6">
              <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                Reports
              </h3>
              <p className="text-sm text-neutral-500 mt-1">Submit and track utility reports.</p>
            </div>
            <ReportForm onCancel={() => setActiveTab('overview')} />
          </div>
        )}
      </div>
    </div>
  )
}
