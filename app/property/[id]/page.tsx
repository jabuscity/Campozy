import * as React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { HousingService } from '@/services/housing-service'
import { TrustService } from '@/services/trust-service'
import { CampozyScore } from '@/components/ui/campozy-score'
import { VerificationBadge } from '@/components/ui/verification-badge'
import { VerificationTooltip } from '@/components/ui/verification-tooltip'
import { UtilityMatrix } from '@/components/ui/utility-matrix'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PropertySaveButton from '@/components/property-save-button'
import { 
  MapPin, Users, Trash2, MessageSquare, ArrowLeft, Share2 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { IdentityService } from '@/services/identity-service'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const property = await HousingService.getPropertyById(id)
  return {
    title: property?.name || 'Property Detail',
    description: `Verified housing in ${property?.neighborhood?.name}. Campozy Score: ${property?.campozy_score}/100. ${property?.description?.slice(0, 100)}...`,
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await HousingService.getPropertyById(id)
  const scoreDimensions = await TrustService.getScoreDimensionAverages(id)
  const currentUser = await IdentityService.getCurrentUser()

  if (!property) return <div>Property not found</div>

  const primaryImage = property.media?.find(m => m.is_primary)?.url || property.media?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200'

  return (
    <div className="bg-white min-h-screen pb-20 text-neutral-900">
      {/* Header Actions */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-between font-medium">
        <Link href="/housing" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Housing
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-neutral-500"><Share2 className="h-5 w-5" /></Button>
          <PropertySaveButton propertyId={property.id} userId={currentUser?.id} initialIsSaved={currentUser ? await HousingService.isPropertySaved(property.id) : false} />
        </div>
      </div>

      {/* Hero Gallery Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ImageCarousel
          images={property.media?.map(m => ({ url: m.url, alt: property.name })) || [{ url: primaryImage, alt: property.name }]}
          aspectRatio="wide"
          className="rounded-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl pointer-events-none" />
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-auto text-white">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black mb-2 sm:mb-4 tracking-tight uppercase italic">{property.name}</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
             <div className="flex items-center gap-1.5 text-base sm:text-lg font-medium opacity-90">
               <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
               {property.neighborhood?.name}, {property.address}
             </div>
             <Badge variant="secondary" className="px-3 py-0.5 sm:px-4 sm:py-1 backdrop-blur-md bg-white/20 border-none text-white font-bold text-xs sm:text-sm">
               {property.property_type?.name || 'Hostel'}
             </Badge>
             <VerificationTooltip level={property.verification_level || 'unverified'} scoutName="Scout Official">
               <VerificationBadge level={property.verification_level || 'unverified'} className="backdrop-blur-md bg-white/20 border-none text-white" />
             </VerificationTooltip>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          {/* Overview */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-4 md:mb-6 uppercase tracking-tight italic">Hostel Overview</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              {property.description || "No description provided for this verified property. However, it holds a Campozy official score based on student intelligence."}
            </p>
          </section>

          {/* Utility Intelligence Matrix */}
          <section className="bg-neutral-50 rounded-3xl p-4 md:p-8 border border-neutral-100">
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-4 md:mb-6 uppercase tracking-tight italic">Utility Intelligence</h2>
            <UtilityMatrix
              items={[
                { label: 'electricity', value: `${Math.round((scoreDimensions?.electricity || 0) * 20)}% uptime. Backup generator available.`, status: (scoreDimensions?.electricity || 0) >= 4 ? 'good' : (scoreDimensions?.electricity || 0) >= 3 ? 'warning' : 'bad' },
                { label: 'water', value: `Reliability score: ${scoreDimensions?.water || 0}/5. Community reported.`, status: (scoreDimensions?.water || 0) >= 4 ? 'good' : (scoreDimensions?.water || 0) >= 3 ? 'warning' : 'bad' },
                { label: 'wifi', value: `Connectivity score: ${scoreDimensions?.internet || 0}/5. Average student experience.`, status: (scoreDimensions?.internet || 0) >= 4 ? 'good' : (scoreDimensions?.internet || 0) >= 3 ? 'warning' : 'bad' },
                { label: 'security', value: `Safety score: ${scoreDimensions?.safety || 0}/5. Verified by scouts and students.`, status: (scoreDimensions?.safety || 0) >= 4 ? 'good' : (scoreDimensions?.safety || 0) >= 3 ? 'warning' : 'bad' },
              ]}
            />
          </section>

          {/* Additional Trust Scores */}
          <section className="bg-neutral-50 rounded-3xl p-4 md:p-8 border border-neutral-100">
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-4 md:mb-6 uppercase tracking-tight italic">Additional Scores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
               <ScoreItem label="Hygiene & Sanitation" score={scoreDimensions?.hygiene || 0} icon={<Trash2 />} color="text-red-400" />
               <ScoreItem label="Management Responsiveness" score={scoreDimensions?.management || 0} icon={<MessageSquare />} color="text-purple-400" />
            </div>
          </section>

          {/* Rooms Section */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-6 md:mb-8 uppercase tracking-tight italic">Available Units</h2>
            <div className="space-y-3 md:space-y-4">
               {property.rooms?.map(room => (
                 <div key={room.id} className="flex items-center justify-between p-4 md:p-6 rounded-2xl border border-neutral-200 hover:border-primary transition-colors hover:shadow-lg bg-white">
                    <div className="flex items-center gap-6">
                       <div className="h-16 w-16 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                          <Users className="h-8 w-8" />
                       </div>
                       <div>
                          <h4 className="text-xl font-bold text-neutral-900">{room.room_type}</h4>
                          <p className="text-neutral-500 font-medium">Capacity: {room.capacity} Student{room.capacity > 1 ? 's' : ''}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-black text-neutral-900">KES {room.price_per_month?.toLocaleString()}</div>
                       <p className="text-neutral-400 text-sm font-medium">per month</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* Right Column: Score Summary & Action Card */}
        <div className="space-y-8">
           {/* Campozy Score Summary Card */}
           <div className="sticky top-32 p-8 rounded-[2.5rem] bg-neutral-900 text-white shadow-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 blur-3xl -z-1" />
              <div className="text-center">
                 <CampozyScore score={property.campozy_score} size="lg" className="mb-6" />
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Official Score</h3>
                 <p className="text-neutral-400 mb-8 font-medium">
                    This score is calculated based on 10 dimensions of verified student data from this semester.
                 </p>
                 
                  <div className="space-y-4">
                     <Button size="lg" className="w-full text-xl font-bold h-16 shadow-lg shadow-primary/40" asChild>
                        <Link href={`/report?propertyId=${property.id}`}>Report Utility Issue</Link>
                     </Button>
                     <PropertySaveButton propertyId={property.id} userId={currentUser?.id} initialIsSaved={currentUser ? await HousingService.isPropertySaved(property.id) : false} />
                  </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center gap-3">
                 <Badge variant="success" className="bg-success text-white">Trust Engine Active</Badge>
                 <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Last updated today</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function ScoreItem({ label, score, icon, color }: { label: string, score: number, icon: React.ReactNode, color: string }) {
  const percentage = (score / 5) * 100
  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-neutral-800 uppercase tracking-tighter">
             <div className={cn("p-1.5 rounded-lg bg-white shadow-sm border border-neutral-100", color)}>
               {icon}
             </div>
             {label}
          </div>
          <span className="font-black text-neutral-900">{score.toFixed(1)}/5.0</span>
       </div>
       <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
          <div 
             className={cn("h-full transition-all duration-1000", color.replace('text-', 'bg-'))} 
             style={{ width: `${percentage}%` }} 
          />
       </div>
    </div>
  )
}

