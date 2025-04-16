import React, {useState} from "react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {IoMdCloseCircle} from "react-icons/io";
import {IoIosSettings} from "react-icons/io";
import {RiDashboardFill} from "react-icons/ri";
import {FiLogOut} from "react-icons/fi";
import {useAuth} from "@/components/auth/auth-context";
import {supabase} from "@/lib/supabase";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {BiSearchAlt} from "react-icons/bi";

export enum SidebarType {
    'home' = 'home',
    'settings' = 'settings',
    'idea-finder' = 'idea-finder'
}

const Sidebar = (
    {sideNav, closeContent}: {
        sideNav: (sidebarType: SidebarType) => void,
        closeContent?: () => void
    }) => {
    const [sidebarType, setSidebarType] = useState<SidebarType>(SidebarType.home);
    const {user} = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <aside
            className="absolute inset-y-0 right-0 z-10 flex w-14 flex-col border-r bg-background border-l-[1px]">
            {closeContent && <a
                className="hover:cursor-pointer flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground ml-auto mr-auto"
                href="#" onClick={() => {
                closeContent()
            }}
            >
                <IoMdCloseCircle className="h-4 w-4 transition-all group-hover:scale-110"/>
                <span className="sr-only">close sidebar</span>
            </a>
            }
            {user && (
                <div className="flex flex-col items-center gap-2 py-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{getInitials(user.email || '')}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="right">{user.email}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
            <nav className="flex flex-col items-center gap-4 px-2 py-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <a
                                className={`hover:cursor-pointer flex h-9 w-9 items-center justify-center  text-muted-foreground transition-colors ${sidebarType == SidebarType.home ? "rounded-full bg-primary text-lg font-semibold text-primary-foreground" : ""}`}
                                href="#" onClick={() => {
                                setSidebarType(SidebarType.home)
                                sideNav(SidebarType.home)
                            }}
                            >
                                <RiDashboardFill
                                    className={`h-4 w-4 transition-all group-hover:scale-110`}/>
                                <span className="sr-only">home</span>
                            </a>
                        </TooltipTrigger>
                        <TooltipContent side="right">home</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <a
                                className={`hover:cursor-pointer flex h-9 w-9 items-center justify-center  text-muted-foreground transition-colors ${sidebarType == SidebarType["idea-finder"] ? "rounded-full bg-primary text-lg font-semibold text-primary-foreground" : ""}`}
                                href="#" onClick={() => {
                                setSidebarType(SidebarType["idea-finder"])
                                sideNav(SidebarType["idea-finder"])
                            }}
                            >
                                <BiSearchAlt
                                    className={`h-4 w-4 transition-all group-hover:scale-110`}/>
                                <span className="sr-only">idea finder</span>
                            </a>
                        </TooltipTrigger>
                        <TooltipContent side="right">Idea Finder</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <a
                                className={`hover:cursor-pointer flex h-9 w-9 items-center justify-center  text-muted-foreground transition-colors ${sidebarType == SidebarType.settings ? "rounded-full bg-primary text-lg font-semibold text-primary-foreground" : ""} `}
                                href="#" onClick={() => {
                                setSidebarType(SidebarType.settings)
                                sideNav(SidebarType.settings)
                            }}
                            >
                                <IoIosSettings
                                    className={`h-5 w-5`}/>
                                <span className="sr-only">Settings</span>
                            </a>
                        </TooltipTrigger>
                        <TooltipContent side="right">Settings</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {user && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    className="hover:cursor-pointer flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                    href="#"
                                    onClick={handleLogout}
                                >
                                    <FiLogOut className="h-4 w-4"/>
                                    <span className="sr-only">Logout</span>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">Logout</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;


