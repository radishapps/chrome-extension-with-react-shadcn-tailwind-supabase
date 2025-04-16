import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface PageInfo {
  title: string;
  url: string;
  description: string;
}

export function PageSummaryCard() {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to get current tab info
    const getCurrentTab = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          setPageInfo({
            title: tab.title || 'Unknown Title',
            url: tab.url || '',
            description: 'Loading content...',
          });
        }
      } catch (error) {
        console.error('Error getting tab info:', error);
        setLoading(false);
      }
    };

    // Listen for content updates from the content script
    const messageListener = (
      message: { type: string; payload: PageInfo },
      sender: chrome.runtime.MessageSender
    ) => {
      if (message.type === 'PAGE_CONTENT_UPDATED') {
        setPageInfo(message.payload);
        setLoading(false);
      }
    };

    // Get initial tab info
    getCurrentTab();

    // Add message listener
    chrome.runtime.onMessage.addListener(messageListener);

    // Listen for tab updates
    const tabUpdateListener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (changeInfo.status === 'complete') {
        getCurrentTab();
        setLoading(true);
      }
    };

    chrome.tabs.onUpdated.addListener(tabUpdateListener);

    // Cleanup listeners
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      chrome.tabs.onUpdated.removeListener(tabUpdateListener);
    };
  }, []);

  if (!pageInfo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[160px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-[80%]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg break-words">Current Page</CardTitle>
        <CardDescription>Summary of the current webpage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="font-medium break-words">{pageInfo.title}</h3>
          <p className="text-sm text-muted-foreground break-all">{pageInfo.url}</p>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <p className="text-sm text-muted-foreground break-words line-clamp-3">
              {pageInfo.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 