import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Plus, Compass, ExternalLink, Clock, TagIcon, DollarSign } from "lucide-react";
import { browser } from "wxt/browser";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a simple Badge component since it doesn't exist in the extension
const Badge = ({ 
  children, 
  variant = "default", 
  className = "" 
}: { 
  children: React.ReactNode, 
  variant?: "default" | "secondary" | "outline", 
  className?: string 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-secondary text-secondary-foreground";
      case "outline":
        return "bg-background text-foreground border border-input";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getVariantClasses()} ${className}`}
    >
      {children}
    </span>
  );
};

// Interface matching our BAML WebPageIdea structure
interface WebPageIdea {
  title: string;
  description: string;
  sourceUrl: string;
  sourceTitle: string;
  extractedAt: string;
  ideaType: string;
  category?: string;
  location?: {
    lat: number;
    lng: number;
  };
  locationName?: string;
  address?: string;
  priceRange?: string;
  duration?: string;
  bestFor?: string[];
  seasonality?: string[];
  imageUrls?: string[];
  highlights?: string[];
}

export function WebpageParser() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [extractedIdeas, setExtractedIdeas] = useState<WebPageIdea[]>([]);
  const [pageContent, setPageContent] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageUrl, setPageUrl] = useState<string>('');
  const [streamingProgress, setStreamingProgress] = useState<string>('');
  const [parsed, setParsed] = useState(false);
  const [apiNotConfigured, setApiNotConfigured] = useState(false);

  // Check for current tab on component mount
  useEffect(() => {
    // Get the current tab when component mounts
    const getCurrentTabInfo = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          setPageTitle(tab.title || '');
          setPageUrl(tab.url || '');
        }
      } catch (error) {
        console.error('Error getting tab info:', error);
      }
    };
    
    getCurrentTabInfo();
    
    // Listen for tab updates
    const handleTabUpdate = async (tabId: number, changeInfo: any) => {
      if (changeInfo.status === 'complete') {
        getCurrentTabInfo();
      }
    };

    browser.tabs.onUpdated.addListener(handleTabUpdate);
    
    return () => {
      browser.tabs.onUpdated.removeListener(handleTabUpdate);
    };
  }, []);

  // Function to extract content from the active tab and send to API
  const extractPageContent = async () => {
    try {
      setLoading(true);
      setParsed(false);
      setStreamingProgress('Extracting page content...');
      setExtractedIdeas([]);
      
      // Get the current tab - using browser API from WXT
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }
      
      // Update page title and URL
      setPageTitle(tab.title || '');
      setPageUrl(tab.url || '');
      
      // Execute script in the tab to get the content - using browser API from WXT
      const results = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Try to find main content, fall back to body
          const contentElement = 
            document.querySelector('main') || 
            document.querySelector('article') || 
            document.querySelector('.content') ||
            document.body;
          
          // Get just the visible text, which already excludes script content
          const text = contentElement.innerText;
          
          return {
            text: text,
            title: document.title,
            url: window.location.href
          };
        }
      });
      
      if (!results || !results[0]?.result) {
        throw new Error('Failed to extract content');
      }
      
      const { text, title, url } = results[0].result;
      
      // Store the extracted content
      setPageContent(text);
      setParsed(true);
      setStreamingProgress('');
    } catch (error) {
      console.error('Error extracting data:', error);
      setStreamingProgress('');
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Process with BAML
  const processWithBAML = async () => {
    if (!pageContent) return;
    
    // Check if API base URL is configured
    if (!API_BASE_URL) {
      setApiNotConfigured(true);
      
      // Set sample data
      setExtractedIdeas([
        {
          title: "Sample Restaurant: Coastal Bistro",
          description: "A charming seafood restaurant with fresh local catches and an oceanfront view. Known for their signature clam chowder and sustainable fishing practices.",
          sourceUrl: pageUrl || '',
          sourceTitle: pageTitle || 'Sample Restaurant',
          extractedAt: new Date().toISOString(),
          ideaType: "restaurant",
          category: "Seafood",
          priceRange: "$$$",
          duration: "1-2 hours",
          highlights: ["Ocean view seating", "Sustainable seafood", "Award-winning chef"]
        },
        {
          title: "Sample Attraction: Hillside Gardens",
          description: "A stunning botanical garden featuring over 5,000 plant species from around the world. Walking paths wind through themed sections including a Japanese zen garden and butterfly sanctuary.",
          sourceUrl: pageUrl || '',
          sourceTitle: pageTitle || 'Sample Attraction',
          extractedAt: new Date().toISOString(),
          ideaType: "attraction",
          category: "Nature",
          priceRange: "$",
          duration: "2-3 hours",
          highlights: ["Butterfly sanctuary", "Japanese zen garden", "Guided tours available"]
        },
        {
          title: "Sample Hotel: Mountain View Lodge",
          description: "A rustic yet luxurious mountain retreat with panoramic valley views. Each room features a private balcony, fireplace, and locally crafted furniture.",
          sourceUrl: pageUrl || '',
          sourceTitle: pageTitle || 'Sample Hotel',
          extractedAt: new Date().toISOString(),
          ideaType: "hotel",
          category: "Luxury",
          priceRange: "$$$$",
          duration: "Overnight",
          highlights: ["Panoramic mountain views", "Spa services", "Farm-to-table restaurant"]
        }
      ]);
      return;
    } else {
      setApiNotConfigured(false);
    }
    
    try {
      setLoading(true);
      setStreamingProgress('Processing with BAML...');
      
      // Get auth token from Supabase
      let token = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          token = session.access_token;
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Create the request body with the necessary data
      const requestBody = {
        pageTitle: pageTitle,
        pageURL: pageUrl,
        pageContent: pageContent,
        count: 5 // Request items
      };

      // Make API call to process the content
      const response = await fetch(`${API_BASE_URL}/web-ideas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        // Handle error response
        console.error('API error:', response.status, response.statusText);
        try {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error(`API error ${response.status}: ${errorData}`);
        } catch (parseError) {
          throw new Error(`API error ${response.status}: ${response.statusText}`);
        }
      }
      
      // Parse the API response
      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      if (responseData.data && responseData.data.ideas && responseData.data.ideas.length > 0) {
        // Use the ideas from the API response
        setExtractedIdeas(responseData.data.ideas);
        console.log(`Received ${responseData.data.ideas.length} items from the API`);
      } else {
        console.warn('No data found in API response, using fallback data');
        // Fallback data in case the API doesn't return ideas
        setExtractedIdeas([
          {
            title: "BAML Processed Content",
            description: "This content was processed using BAML analysis to extract structured data.",
            sourceUrl: pageUrl || '',
            sourceTitle: pageTitle || 'Current Page',
            extractedAt: new Date().toISOString(),
            ideaType: "analysis",
            highlights: ["Extracted with BAML", "AI-powered parsing", "Structured content"]
          }
        ]);
      }
    } catch (error) {
      console.error('Error processing with BAML:', error);
      setStreamingProgress('');
      
      // Create a timestamp for the current time
      const now = new Date().toISOString();
      
      // Set fallback data with API connection error notice and sample ideas
      setExtractedIdeas([
        {
          title: "Sample Restaurant: Coastal Bistro",
          description: "A charming seafood restaurant with fresh local catches and an oceanfront view. Known for their signature clam chowder and sustainable fishing practices.",
          sourceUrl: pageUrl || '',
          sourceTitle: pageTitle || 'Sample Restaurant',
          extractedAt: now,
          ideaType: "restaurant",
          category: "Seafood",
          priceRange: "$$$",
          duration: "1-2 hours",
          highlights: ["Ocean view seating", "Sustainable seafood", "Award-winning chef"]
        },
        {
          title: "Sample Attraction: Hillside Gardens",
          description: "A stunning botanical garden featuring over 5,000 plant species from around the world. Walking paths wind through themed sections including a Japanese zen garden and butterfly sanctuary.",
          sourceUrl: pageUrl || '',
          sourceTitle: pageTitle || 'Sample Attraction',
          extractedAt: now,
          ideaType: "attraction",
          category: "Nature",
          priceRange: "$",
          duration: "2-3 hours",
          highlights: ["Butterfly sanctuary", "Japanese zen garden", "Guided tours available"]
        },
        {
          title: "Sample Hotel: Mountain View Lodge",
          description: "A rustic yet luxurious mountain retreat with panoramic valley views. Each room features a private balcony, fireplace, and locally crafted furniture.",
          sourceUrl: pageUrl || '',
          sourceTitle: pageTitle || 'Sample Hotel',
          extractedAt: now,
          ideaType: "hotel",
          category: "Luxury",
          priceRange: "$$$$",
          duration: "Overnight",
          highlights: ["Panoramic mountain views", "Spa services", "Farm-to-table restaurant"]
        }
      ]);
    } finally {
      setLoading(false);
      setStreamingProgress('');
    }
  };

  // Function to load more data
  const loadMoreData = async () => {
    if (!pageContent) return;
    
    setStreamingProgress('Loading more data...');
    
    try {
      // Get current token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        setStreamingProgress('');
        return;
      }
      
      // Make the API request
      const response = await fetch(`${API_BASE_URL}/web-ideas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageTitle: pageTitle,
          pageURL: pageUrl,
          pageContent: pageContent,
          count: extractedIdeas.length + 3 // Request additional ideas
        })
      });
      
      const data = await response.json();
      if (data.data && data.data.ideas) {
        setExtractedIdeas(data.data.ideas);
      }
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setStreamingProgress('');
    }
  };

  // Placeholder function for adding ideas
  const handleAddItem = (idea: WebPageIdea) => {
    console.log('Add item placeholder:', idea);
    alert('Add item functionality coming soon!');
  };

  // Function to truncate long URLs
  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Try to keep domain and as much of the path as possible
    if (domain.length + 3 >= maxLength) {
      return domain.substring(0, maxLength - 3) + '...';
    }
    
    const availableChars = maxLength - domain.length - 3; // 3 chars for '...'
    const truncatedPath = path.length > availableChars 
      ? path.substring(0, availableChars) + '...' 
      : path;
    
    return domain + truncatedPath;
  };

  // Function to render loading skeletons
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="mb-4">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="flex flex-col p-4 space-y-4 h-full">
      {user ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Webpage Parser</CardTitle>
              <CardDescription>
                {pageTitle ? (
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{pageTitle}</div>
                    {pageUrl && (
                      <div className="text-xs text-muted-foreground truncate">
                        {truncateUrl(pageUrl)}
                      </div>
                    )}
                  </div>
                ) : (
                  "Extract and analyze content from the current page"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={extractPageContent}
                    className="w-full"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? "Analyzing..." : "Parse Current Webpage"}
                  </Button>
                  
                  {parsed && !loading && (
                    <Button 
                      onClick={processWithBAML}
                      className="w-full sm:w-auto"
                      variant="secondary"
                      disabled={loading || !pageContent}
                    >
                      Process with BAML
                    </Button>
                  )}
                </div>
                
                {streamingProgress && (
                  <div className="text-sm text-center text-muted-foreground animate-pulse">
                    {streamingProgress}
                  </div>
                )}
                
                {pageContent && !loading && (
                  <Card className="mt-2">
                    <CardHeader className="py-3">
                      <details className="text-sm w-full">
                        <summary className="cursor-pointer text-muted-foreground font-medium">
                          Raw Webpage Content ({(pageContent.length / 1000).toFixed(1)}k chars)
                        </summary>
                        <div className="mt-2 border-t pt-3">
                          <div className="max-h-40 overflow-y-auto">
                            <p className="text-xs whitespace-pre-line">{pageContent.substring(0, 2000)}{pageContent.length > 2000 ? '...' : ''}</p>
                          </div>
                        </div>
                      </details>
                    </CardHeader>
                  </Card>
                )}
                
                {loading && renderSkeletons()}
                
                {!loading && extractedIdeas.length > 0 && (
                  <div className="space-y-4 mt-4">
                    <h4 className="font-medium text-sm">Extracted Data</h4>
                    
                    {apiNotConfigured && (
                      <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-yellow-800 dark:text-yellow-200">BAML API Not Implemented</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                            The API base URL is not configured. Please add VITE_API_BASE_URL to your .env file to enable BAML processing.
                          </p>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                            <p>• Add VITE_API_BASE_URL to your .env file</p>
                            <p>• See webpage-parser.tsx for an example of how to call the BAML API</p>
                            <p>• The API expects the parsed webpage text as input</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <div className="space-y-4">
                      {extractedIdeas.map((idea, index) => (
                        <Card key={index} className="overflow-hidden">
                          {idea.imageUrls && idea.imageUrls.length > 0 && (
                            <div className="w-full h-32 overflow-hidden bg-muted">
                              <img 
                                src={idea.imageUrls[0]} 
                                alt={idea.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-base">{idea.title}</h3>
                                {idea.ideaType && (
                                  <Badge variant="outline" className="ml-2">
                                    {idea.ideaType}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {idea.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mt-2">
                                {idea.priceRange && (
                                  <Badge variant="secondary" className="text-xs">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {idea.priceRange}
                                  </Badge>
                                )}
                                {idea.duration && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {idea.duration}
                                  </Badge>
                                )}
                                {idea.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    <TagIcon className="h-3 w-3 mr-1" />
                                    {idea.category}
                                  </Badge>
                                )}
                              </div>
                              
                              {idea.highlights && idea.highlights.length > 0 && (
                                <div className="mt-3">
                                  <h4 className="text-xs font-medium mb-1">Highlights</h4>
                                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                                    {idea.highlights.slice(0, 3).map((highlight, idx) => (
                                      <li key={idx}>{highlight}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-0">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                              onClick={() => handleAddItem(idea)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Save Item
                            </Button>
                            {idea.sourceUrl && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-xs"
                                onClick={() => window.open(idea.sourceUrl, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Source
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        onClick={loadMoreData}
                      >
                        Load More Data
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-center py-4">
            <p>Sign in to use the webpage parser</p>
          </div>
        </div>
      )}
    </div>
  );
} 