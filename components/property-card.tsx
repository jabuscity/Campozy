"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Wifi, Droplet, Zap, ArrowRight, Star } from "lucide-react";
import { Property } from "@/types";
import { CampozyScore } from "./ui/campozy-score";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  index?: number;
  variant?: "default" | "neighborhood";
  onClick?: () => void;
}

export function PropertyCard({ property, index = 0, variant = "default", onClick }: PropertyCardProps) {
  const primaryMedia =
    property.media?.find((m) => m.is_primary) || property.media?.[0];
  const placeholder =
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800";
  const minPrice = property.monthly_price || 0;

  if (variant === "neighborhood") {
    const score = property.campozy_score || 0
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        {onClick ? (
          <div onClick={onClick} role="button" tabIndex={0} className="group block cursor-pointer">
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={primaryMedia?.url || placeholder}
                alt={property.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-bold">{(score / 20).toFixed(1)}</span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base line-clamp-1 mb-1">
                  {property.name}
                </h3>
                <p className="text-white/90 text-sm font-semibold">
                  {minPrice.toLocaleString()} <span className="text-white/70 text-xs font-normal">KES / mon</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Link href={`/property/${property.id}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={primaryMedia?.url || placeholder}
                alt={property.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-bold">{(score / 20).toFixed(1)}</span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base line-clamp-1 mb-1">
                  {property.name}
                </h3>
                <p className="text-white/90 text-sm font-semibold">
                  {minPrice.toLocaleString()} <span className="text-white/70 text-xs font-normal">KES / mon</span>
                </p>
              </div>
            </div>
          </Link>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {onClick ? (
        <div onClick={onClick} role="button" tabIndex={0} className="group block cursor-pointer">
          <div className="overflow-hidden rounded-2xl bg-white border border-neutral-200 transition-all hover:shadow-2xl hover:border-primary/20">
            {/* Top Media Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={primaryMedia?.url || placeholder}
                alt={property.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge
                  variant="secondary"
                  className="backdrop-blur-md bg-white/90 text-primary border-none shadow-sm"
                >
                  {property.property_type?.name || "Hostel"}
                </Badge>
                {property.verification_level !== "unverified" && (
                  <Badge
                    variant="success"
                    className="backdrop-blur-md bg-white/90 border-none shadow-sm"
                  >
                    Verified
                  </Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <CampozyScore
                  score={property.campozy_score}
                  size="sm"
                  showLabel={false}
                  className="bg-white/90 backdrop-blur-md rounded-full shadow-sm"
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 md:p-5">
              <h3 className="text-base md:text-lg font-bold text-neutral-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                {property.name}
              </h3>

              <div className="flex items-center gap-1.5 text-neutral-400 text-sm mb-4">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">
                  {property.neighborhood?.name || property.neighborhoods?.name || 'Unknown area'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 pt-3 md:pt-4 border-t border-neutral-50">
                <UtilityIcon
                  icon={<Droplet />}
                  active={property.utilities?.some(
                    (u) => u.utility_type?.name === "Water",
                  )}
                />
                <UtilityIcon
                  icon={<Zap />}
                  active={property.utilities?.some(
                    (u) => u.utility_type?.name === "Electricity",
                  )}
                />
                <UtilityIcon
                  icon={<Wifi />}
                  active={property.utilities?.some(
                    (u) => u.utility_type?.name === "Internet",
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg md:text-xl font-black text-neutral-900 leading-none tracking-tight">
                    {minPrice.toLocaleString()}
                  </span>
                  <span className="text-neutral-400 text-[10px] uppercase font-bold ml-1 tracking-widest">
                    KES / mon
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link href={`/property/${property.id}`} className="group block">
          <div className="overflow-hidden rounded-2xl bg-white border border-neutral-200 transition-all hover:shadow-2xl hover:border-primary/20">
            {/* Top Media Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={primaryMedia?.url || placeholder}
                alt={property.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge
                  variant="secondary"
                  className="backdrop-blur-md bg-white/90 text-primary border-none shadow-sm"
                >
                  {property.property_type?.name || "Hostel"}
                </Badge>
                {property.verification_level !== "unverified" && (
                  <Badge
                    variant="success"
                    className="backdrop-blur-md bg-white/90 border-none shadow-sm"
                  >
                    Verified
                  </Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <CampozyScore
                  score={property.campozy_score}
                  size="sm"
                  showLabel={false}
                  className="bg-white/90 backdrop-blur-md rounded-full shadow-sm"
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 md:p-5">
              <h3 className="text-base md:text-lg font-bold text-neutral-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                {property.name}
              </h3>

              <div className="flex items-center gap-1.5 text-neutral-400 text-sm mb-4">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">
                  {property.neighborhood?.name || property.neighborhoods?.name || 'Unknown area'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 pt-3 md:pt-4 border-t border-neutral-50">
                <UtilityIcon
                  icon={<Droplet />}
                  active={property.utilities?.some(
                    (u) => u.utility_type?.name === "Water",
                  )}
                />
                <UtilityIcon
                  icon={<Zap />}
                  active={property.utilities?.some(
                    (u) => u.utility_type?.name === "Electricity",
                  )}
                />
                <UtilityIcon
                  icon={<Wifi />}
                  active={property.utilities?.some(
                    (u) => u.utility_type?.name === "Internet",
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg md:text-xl font-black text-neutral-900 leading-none tracking-tight">
                    {minPrice.toLocaleString()}
                  </span>
                  <span className="text-neutral-400 text-[10px] uppercase font-bold ml-1 tracking-widest">
                    KES / mon
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}
    </motion.div>
  );
}

function UtilityIcon({
  icon,
  active,
}: {
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
        active ? "bg-primary/5 text-primary" : "bg-neutral-50 text-neutral-300",
      )}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(
            icon as React.ReactElement<{ className?: string }>,
            {
              className: "h-4 w-4",
            },
          )
        : icon}
    </div>
  );
}
