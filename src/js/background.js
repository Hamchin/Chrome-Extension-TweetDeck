// インストールイベント
chrome.runtime.onInstalled.addListener(() => {
    // コンテキストメニュー: カスタムタイムライン
    chrome.contextMenus.create({
        type: 'normal',
        id: 'CUSTOM_TIMELINE',
        title: 'タイムラインをカスタマイズする',
        documentUrlPatterns: ['https://tweetdeck.twitter.com/*']
    });
});

// クリックイベント: コンテキストメニュー
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // タイムラインをカスタマイズする
    if (info.menuItemId === 'CUSTOM_TIMELINE') {
        chrome.tabs.sendMessage(tab.id, 'CUSTOM_TIMELINE');
    }
});
