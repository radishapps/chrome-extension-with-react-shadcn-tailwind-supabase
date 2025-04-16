// HomePage.js
import React from "react";
import {Card} from "@/components/ui/card.tsx";
import {useTranslation} from "react-i18next";
import { useAuth } from "@/components/auth/auth-context";

export function Home() {
    const {t} = useTranslation();
    const { user } = useAuth();
    
    const references = [
        {
            name: "Wxt",
            url: "https://wxt.dev/"
        },
        {
            name: "React",
            url: "https://react.dev/"
        },
        {
            name: "Tailwind css",
            url: "https://tailwindcss.com/"
        },
        {
            name: "Shadcn Ui",
            url: "https://ui.shadcn.com/"
        },
        {
            name: "Supabase",
            url: "https://supabase.com/"
        }, 
        {
            name: "BAML",
            url: "https://www.boundaryml.com/"
        }
    ]
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="text-left">
                <div className="flex flex-col space-y-1.5 p-6 pb-3">
                    <h3 className="font-semibold leading-none tracking-tight text-base">{t("introduce")}</h3>
                    <p className="text-sm max-w-lg text-balance leading-relaxed">
                        {t("description")}
                    </p>
                    
                    {/* User information section */}
                    <div className="border-t mt-4 pt-4">
                        <h4 className="font-medium text-sm mb-2">Supabase User Information</h4>
                        {user ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start">
                                    <span className="font-medium w-20">Email:</span>
                                    <span className="text-muted-foreground">{user.email}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium w-20">User ID:</span>
                                    <span className="text-muted-foreground truncate">{user.id}</span>
                                </div>
                                {user.user_metadata && (
                                    <>
                                        {user.user_metadata.name && (
                                            <div className="flex items-start">
                                                <span className="font-medium w-20">Name:</span>
                                                <span className="text-muted-foreground">{user.user_metadata.name}</span>
                                            </div>
                                        )}
                                        {user.user_metadata.avatar_url && (
                                            <div className="flex items-center mt-2">
                                                <img 
                                                    src={user.user_metadata.avatar_url} 
                                                    alt="Profile" 
                                                    className="h-10 w-10 rounded-full"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Not logged in. Sign in to see user information.</p>
                        )}
                    </div>
                </div>
            </Card>
            <Card className="text-left">
                <div className="flex flex-col space-y-1.5 p-6 pb-3">
                    <h3 className="font-semibold leading-none tracking-tight text-base">{t("reference")}</h3>
                    <div className="flex flex-col gap-4 pt-2">
                        {
                            references.map((reference, index, array) => {
                                return (
                                    <div className="grid gap-1" key={index}>
                                        <p className="text-sm font-medium leading-none">
                                            {reference.name}
                                        </p>
                                        <a className="text-sm text-muted-foreground" href={reference.url}
                                           target="_blank">{reference.url}</a>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </Card>
        </div>

    )
}
