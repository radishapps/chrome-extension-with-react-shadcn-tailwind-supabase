import React, {useEffect, useRef, useState} from 'react';
import './App.module.css';
import '../../assets/main.css'
import Sidebar, {SidebarType} from "./sidebar.tsx";
import {browser} from "wxt/browser";
import ExtMessage, {MessageType} from "@/entrypoints/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Home} from "@/entrypoints/sidepanel/home.tsx";
import {SettingsPage} from "@/entrypoints/sidepanel/settings.tsx";
import {WebpageParser} from "./webpage-parser.tsx";
import {useTheme} from "@/components/theme-provider.tsx";
import {useTranslation} from 'react-i18next';
import Header from "@/entrypoints/sidepanel/header.tsx";
import { AuthProvider, useAuth } from "@/components/auth/auth-context";
import { AuthForm } from "@/components/auth/auth-form";

function AppContent() {
    const [showButton, setShowButton] = useState(false)
    const [showCard, setShowCard] = useState(false)
    const [sidebarType, setSidebarType] = useState<SidebarType>(SidebarType.home);
    const [headTitle, setHeadTitle] = useState("home")
    const [buttonStyle, setButtonStyle] = useState<any>();
    const [cardStyle, setCardStyle] = useState<any>();
    const cardRef = useRef<HTMLDivElement>(null);
    const {theme, toggleTheme} = useTheme();
    const {t, i18n} = useTranslation();
    const { user, loading } = useAuth();

    async function initI18n() {
        let data = await browser.storage.local.get('i18n');
        if (data.i18n) {
            await i18n.changeLanguage(data.i18n)
        }
    }

    useEffect(() => {
        browser.runtime.onMessage.addListener((message: ExtMessage, sender, sendResponse) => {
            console.log('sidepanel:')
            console.log(message)
            if (message.messageType == MessageType.changeLocale) {
                i18n.changeLanguage(message.content)
            } else if (message.messageType == MessageType.changeTheme) {
                toggleTheme(message.content)
            }
        });

        initI18n();
    }, []);

    if (loading) {
        return (
            <div className={theme}>
                <div className="fixed top-0 right-0 h-screen w-full bg-background z-[1000000000000] rounded-l-xl shadow-2xl flex items-center justify-center">
                    <p className="text-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={theme}>
                <div className="fixed top-0 right-0 h-screen w-full bg-background z-[1000000000000] rounded-l-xl shadow-2xl p-4">
                    <AuthForm />
                </div>
            </div>
        );
    }

    return (
        <div className={theme}>
            {<div
                className="fixed top-0 right-0 h-screen w-full bg-background z-[1000000000000] rounded-l-xl shadow-2xl flex flex-col">
                <Header headTitle={headTitle}/>
                <Sidebar sideNav={(sidebarType: SidebarType) => {
                    setSidebarType(sidebarType);
                    setHeadTitle(sidebarType);
                }}/>
                <main className="mr-14 grid gap-4 p-4 md:gap-8 md:p-8 flex-1 overflow-y-auto">
                    {sidebarType === SidebarType.home && <Home/>}
                    {sidebarType === SidebarType.settings && <SettingsPage/>}
                    {sidebarType === SidebarType["webpage-parser"] && <WebpageParser/>}
                </main>
            </div>
            }
            {showButton &&
                <Button className="absolute z-[100000]" style={buttonStyle}>send Message</Button>
            }
            {
                <Card ref={cardRef}
                      className={`absolute z-[100000] w-[300px] h-[200px] ${showCard ? 'block' : 'hidden'}`}
                      style={cardStyle}></Card>
            }
        </div>
    );
}

export default () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};
