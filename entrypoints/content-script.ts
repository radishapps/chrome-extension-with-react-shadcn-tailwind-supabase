import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Function to get the most relevant content from the page
    function getPageContent() {
      // Get meta description
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      // Get first paragraph or relevant text content
      const mainContent = document.querySelector('main, article, #content, .content')
      const firstParagraph = mainContent?.querySelector('p')?.textContent || 
                            document.querySelector('p')?.textContent || '';

      // Get heading if available
      const heading = document.querySelector('h1')?.textContent || 
                     document.querySelector('h2')?.textContent || '';

      return {
        title: document.title,
        url: window.location.href,
        description: metaDescription || firstParagraph || heading || 'No description available',
      };
    }

    // Send page content when the content script loads
    chrome.runtime.sendMessage({
      type: 'PAGE_CONTENT_UPDATED',
      payload: getPageContent()
    });

    // Listen for DOM changes and update content
    const observer = new MutationObserver(() => {
      chrome.runtime.sendMessage({
        type: 'PAGE_CONTENT_UPDATED',
        payload: getPageContent()
      });
    });

    // Start observing DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
}); 