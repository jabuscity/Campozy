import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoommateProfile, RoommatePreference } from "@/types";

export interface PreferenceFormProps {
  profile?: Partial<RoommateProfile>;
  preferences?: Partial<RoommatePreference>;
  onSubmit: (data: { profile: Partial<RoommateProfile>; preferences: Partial<RoommatePreference> }) => void;
  step?: number;
  className?: string;
}

function PreferenceForm({
  profile = {},
  preferences = {},
  onSubmit,
  step = 1,
  className,
  ...props
}: PreferenceFormProps) {
  const [formData, setFormData] = React.useState({
    profile,
    preferences,
  });

  const updateField = (section: 'profile' | 'preferences', field: string, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)} {...props}>
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-neutral-900">About You</h3>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Year of Study</label>
            <select
              value={formData.profile.year_of_study ?? ''}
              onChange={e => updateField('profile', 'year_of_study', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select year</option>
              {[1, 2, 3, 4, 5, 6, 7].map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Sleep Schedule</label>
            <select
              value={formData.profile.sleep_schedule ?? ''}
              onChange={e => updateField('profile', 'sleep_schedule', e.target.value || null)}
              className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select schedule</option>
              <option value="early_bird">Early Bird</option>
              <option value="night_owl">Night Owl</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Cleanliness Level</label>
            <select
              value={formData.profile.cleanliness_level ?? ''}
              onChange={e => updateField('profile', 'cleanliness_level', e.target.value || null)}
              className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select level</option>
              <option value="neat">Neat</option>
              <option value="moderate">Moderate</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Social Level</label>
            <select
              value={formData.profile.social_level ?? ''}
              onChange={e => updateField('profile', 'social_level', e.target.value || null)}
              className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select level</option>
              <option value="introvert">Introvert</option>
              <option value="moderate">Moderate</option>
              <option value="extrovert">Extrovert</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Study Habits</label>
            <select
              value={formData.profile.study_habits ?? ''}
              onChange={e => updateField('profile', 'study_habits', e.target.value || null)}
              className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select habits</option>
              <option value="silent">Silent</option>
              <option value="light_noise">Light Noise OK</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-neutral-900">Your Preferences</h3>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Budget Range (KES/month)</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min"
                value={formData.preferences.budget_min ?? ''}
                onChange={e => updateField('preferences', 'budget_min', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                placeholder="Max"
                value={formData.preferences.budget_max ?? ''}
                onChange={e => updateField('preferences', 'budget_max', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Gender Preference</label>
            <select
              value={formData.profile.gender_preference ?? ''}
              onChange={e => updateField('profile', 'gender_preference', e.target.value || null)}
              className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Any</option>
              <option value="male_only">Male Only</option>
              <option value="female_only">Female Only</option>
              <option value="any">Any</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Max Roommates</label>
            <select
              value={formData.profile.max_roommates ?? 1}
              onChange={e => updateField('profile', 'max_roommates', Number(e.target.value))}
              className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <span className="text-sm font-medium text-neutral-700">Smoking OK?</span>
            <button
              type="button"
              onClick={() => updateField('profile', 'smoking_ok', !formData.profile.smoking_ok)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors",
                formData.profile.smoking_ok ? 'bg-primary' : 'bg-neutral-300'
              )}
            >
              <div className={cn("w-4 h-4 bg-white rounded-full shadow transition-transform", formData.profile.smoking_ok ? 'translate-x-7' : 'translate-x-1')} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <span className="text-sm font-medium text-neutral-700">Pets OK?</span>
            <button
              type="button"
              onClick={() => updateField('profile', 'pets_ok', !formData.profile.pets_ok)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors",
                formData.profile.pets_ok ? 'bg-primary' : 'bg-neutral-300'
              )}
            >
              <div className={cn("w-4 h-4 bg-white rounded-full shadow transition-transform", formData.profile.pets_ok ? 'translate-x-7' : 'translate-x-1')} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          Save Preferences
        </Button>
      </div>
    </form>
  );
}

export { PreferenceForm };
