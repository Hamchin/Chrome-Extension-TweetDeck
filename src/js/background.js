// コンテキストメニュー: カスタムタイムライン
chrome.contextMenus.create({
    type: 'normal',
    id: 'CUSTOM_TIMELINE',
    title: 'タイムラインをカスタマイズする',
    documentUrlPatterns: ['https://tweetdeck.twitter.com/*']
}, () => chrome.runtime.lastError);

// クリックイベント: コンテキストメニュー
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // タイムラインをカスタマイズする
    if (info.menuItemId === 'CUSTOM_TIMELINE') {
        chrome.tabs.sendMessage(tab.id, 'CUSTOM_TIMELINE');
    }
});
