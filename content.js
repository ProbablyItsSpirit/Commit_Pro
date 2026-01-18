// content.js
(function() {
    'use strict';

    // 1. Wait for the page to fully load the commit data
    setTimeout(analyzeCommit, 1500);

    async function analyzeCommit() {
        // 2. SCRAPE the data from GitHub's page structure
        // GitHub stores the raw diff in a <div> with certain attributes.
        const diffElement = document.querySelector('[data-file-diff-container]');
        if (!diffElement) {
            console.log('Commit Pro: No diff found on this page.');
            return;
        }

        const commitDiff = diffElement.innerText || 'Could not extract diff';
        const commitMessage = document.querySelector('.commit-title')?.innerText || 'No message';
        const author = document.querySelector('.commit-author')?.innerText || 'Unknown';

        console.log('Commit Pro: Scraped data:', { author, commitMessage });

        // 3. SEND data to your backend
        try {
            const response = await fetch('http://localhost:3000/analyze-commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commitMessage, commitDiff, author })
            });

            const data = await response.json();

            // 4. INJECT the analysis panel onto the page
            injectAnalysisPanel(data.analysis);

        } catch (error) {
            console.error('Commit Pro: Failed to analyze commit', error);
            injectAnalysisPanel('⚠️ Could not generate analysis. Is the backend server running?');
        }
    }

    function injectAnalysisPanel(analysisText) {
        // Find a good spot on the page (e.g., near the commit message)
        const targetLocation = document.querySelector('.commit-title')?.parentElement;

        if (!targetLocation) return;

        // Create our panel
        const panel = document.createElement('div');
        panel.id = 'commit-pro-panel';
        panel.innerHTML = `
            <div style="
                background: #f6f8fa;
                border: 1px solid #d0d7de;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            ">
                <h3 style="margin-top: 0; color: #1a1a1a;">🤖 Commit Pro Analysis</h3>
                <div style="white-space: pre-wrap; color: #24292f;">${analysisText}</div>
            </div>
        `;

        // Insert it into the page
        targetLocation.after(panel);
    }
})();