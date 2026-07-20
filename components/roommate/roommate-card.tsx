import * as React from "react";
import Image from "next/image";
import { MatchBadge } from "@/components/matching/match-badge";
import { Button } from "@/components/ui/button";
import { MapPin, GraduationCap, Calendar, DollarSign, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoommateMatch, RoommateProfile } from "@/types";

export interface RoommateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  match: RoommateMatch;
  profile: RoommateProfile;
  onLike?: () => void;
  onPass?: () => void;
  onMessage?: () => void;
  disableActions?: boolean;
}

function RoommateCard({
  match,
  profile,
  onLike,
  onPass,
  onMessage,
  disableActions = false,
  className,
  ...props
}: RoommateCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="relative h-48 bg-neutral-100">
        <Image
          src={profile.bio ? "https://images.unsplash.com/photo-1523240795612-9a054b0db344?auto=format&fit=crop&q=80&w=600" : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600"}
          alt="Roommate"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <MatchBadge score={Math.round(match.compatibility_score)} size="sm" />
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-lg font-black text-neutral-900">Student {profile.student_id.slice(-4)}</h3>
          <p className="text-sm text-neutral-500 line-clamp-2">{profile.bio || 'No bio yet'}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
          {profile.campus_id && (
            <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
              <MapPin className="h-3 w-3" />
              Same campus
            </span>
          )}
          {profile.year_of_study && (
            <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
              <GraduationCap className="h-3 w-3" />
              Year {profile.year_of_study}
            </span>
          )}
          {profile.budget_range && (
            <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
              <DollarSign className="h-3 w-3" />
              KSh {profile.budget_range[0].toLocaleString()} - {profile.budget_range[1].toLocaleString()}
            </span>
          )}
          {profile.move_in_date && (
            <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
              <Calendar className="h-3 w-3" />
              Moving {new Date(profile.move_in_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {match.match_reasons.slice(0, 3).map((reason, i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-tight text-primary bg-primary/10 px-2 py-1 rounded-full">
              {reason}
            </span>
          ))}
        </div>

        {!disableActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onPass}
            >
              Pass
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={onLike}
            >
              <Heart className="h-4 w-4 mr-1" />
              Like
            </Button>
            {match.status === 'matched' && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={onMessage}
              >
                Message
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { RoommateCard };
