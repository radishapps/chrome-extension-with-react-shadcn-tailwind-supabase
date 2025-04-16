import React, { useState } from "react";
import {ThemeSettings} from "@/components/settings/theme-settings.tsx";
import {I18nSettings} from "@/components/settings/i18n-settings.tsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

// Get API base URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function SettingsPage() {
    const [loading, setLoading] = useState(false);
    
    const testApiCall = async () => {
        try {
            setLoading(true);
            
            // First, get the current session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('No access token available');
            }

            // Test the authenticated endpoint
            console.log('Making API call to:', `${API_BASE_URL}/auth`);
            const response = await fetch(`${API_BASE_URL}/auth`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            alert(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('API Error:', error);
            alert(`Error calling API: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-4">
            <I18nSettings/>
            <ThemeSettings/>
            
            <Card className="p-4">
                <h3 className="text-base font-semibold mb-4">API Tests</h3>
                <div className="space-y-2">
                    <Button 
                        onClick={testApiCall} 
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Testing...' : 'Test Auth API'}
                    </Button>
                </div>
            </Card>
        </div>
    )
}

