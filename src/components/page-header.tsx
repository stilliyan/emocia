import { ThemeSwitch } from "@/components/theme-switch";

export function PageHeader({title,description,action}:{title:string;description:string;action?:React.ReactNode}){return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">{description}</p></div><div className="flex shrink-0 flex-wrap items-center gap-2">{action}<div className="hidden md:block"><ThemeSwitch/></div></div></div>}
