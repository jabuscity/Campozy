import { createClient } from '@/lib/supabase/server'
import type { Profile, RoleName, ContactMethod, IdentityDocument } from '@/types'

// ============================================================================
// IDENTITY SERVICE
// Handles user profiles, roles, contact methods, and identity verification.
// ============================================================================

export const IdentityService = {
  // ── Profile ──────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(*, roles(*)),
        user_badges(*, badges(*))
      `)
      .eq('id', userId)
      .single()

    if (error) return null
    return data as Profile
  },

  async getProfileByUsername(username: string): Promise<Profile | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(*, roles(*)),
        user_badges(*, badges(*))
      `)
      .eq('username', username)
      .single()

    if (error) return null
    return data as Profile
  },

  async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'bio' | 'phone_number'>>
  ) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update profile: ${error.message}`)
    return data as Profile
  },

  async getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    return this.getProfile(user.id)
  },

  // ── Roles ────────────────────────────────────────────────────────────────

  async assignRole(userId: string, roleName: RoleName) {
    const supabase = await createClient()

    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (roleError) throw new Error(`Role "${roleName}" not found`)

    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role_id: role.id }, { onConflict: 'user_id,role_id' })

    if (error) throw new Error(`Failed to assign role: ${error.message}`)
  },

  async removeRole(userId: string, roleName: RoleName) {
    const supabase = await createClient()

    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (!role) return

    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', role.id)
  },

  async getUserRoles(userId: string): Promise<RoleName[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)

    if (error || !data) return []
    return data.map((ur: { roles: { name: RoleName }[] }) => ur.roles[0]?.name).filter((name): name is RoleName => !!name)
  },

  async hasRole(userId: string, roleName: RoleName): Promise<boolean> {
    const roles = await this.getUserRoles(userId)
    return roles.includes(roleName)
  },

  // ── Contact Methods ──────────────────────────────────────────────────────

  async addContactMethod(userId: string, method: Pick<ContactMethod, 'method_type' | 'value' | 'is_primary'>) {
    const supabase = await createClient()

    // If setting as primary, unset existing primaries of same type
    if (method.is_primary) {
      await supabase
        .from('contact_methods')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('method_type', method.method_type)
    }

    const { data, error } = await supabase
      .from('contact_methods')
      .insert({ ...method, user_id: userId })
      .select()
      .single()

    if (error) throw new Error(`Failed to add contact method: ${error.message}`)
    return data
  },

  // ── Identity Documents ───────────────────────────────────────────────────

  async submitDocument(userId: string, doc: Pick<IdentityDocument, 'document_type' | 'document_url'>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('identity_documents')
      .insert({ ...doc, user_id: userId })
      .select()
      .single()

    if (error) throw new Error(`Failed to submit document: ${error.message}`)
    return data
  },

  async reviewDocument(documentId: string, reviewerId: string, status: 'approved' | 'rejected') {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('identity_documents')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single()

    if (error) throw new Error(`Failed to review document: ${error.message}`)

    // If approved, mark profile as verified
    if (status === 'approved') {
      const doc = data as IdentityDocument
      await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', doc.user_id)
    }

    return data
  },
}
