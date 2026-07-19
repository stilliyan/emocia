import { Skeleton } from "@/components/ui/skeleton";export default function Loading(){return <div className="space-y-5" aria-label="Зареждане"><Skeleton className="h-9 w-64"/><div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map(i=><Skeleton key={i} className="h-32"/>)}</div><Skeleton className="h-80"/></div>}

