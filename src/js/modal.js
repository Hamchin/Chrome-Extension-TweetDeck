// モーダルツイートをフィルタリングする
const filterModalTweets = (target) => {
    $(target).find('.stream-item').each((_, item) => {
        // リツイートを非表示にする
        const isRetweet = $(item).find('.tweet-context').length > 0;
        if (isRetweet) $(item).addClass('hidden');
        // リプライを非表示にする
        const isReply = $(item).find('.other-replies').length > 0;
        if (isReply) $(item).addClass('hidden');
    });
};

// モーダル用オブザーバー
const modalObserver = new MutationObserver((mutations) => {
    const target = mutations[0].target;
    if (!target.classList.contains('chirp-container')) return;
    filterModalTweets(target);
});

// モーダルツイートのフィルタリング設定を切り替える
const toggleFilterModalTweets = (modal) => {
    // フィルタリングを無効化する
    if ($(modal).hasClass('filter-enabled')) {
        $(modal).removeClass('filter-enabled');
        $(modal).find('.stream-item').removeClass('hidden');
        modalObserver.disconnect();
    }
    // フィルタリングを有効化する
    else {
        $(modal).addClass('filter-enabled');
        const options = { childList: true, subtree: true };
        modalObserver.observe(modal.get(0), options);
        filterModalTweets(modal.get(0));
    }
};

// ダブルクリックイベント: ヘッダー
$(document).on('dblclick', '.open-modal .column-header-temp', (e) => {
    const modal = $(e.target).closest('.open-modal');
    toggleFilterModalTweets(modal);
});
