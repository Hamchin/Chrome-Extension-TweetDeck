// モーダルタイムラインをフィルタリングする
const filterModalTimeline = (container) => {
    $(container).find('.stream-item').each((_, item) => {
        // リツイートを非表示にする
        const isRetweet = $(item).find('.tweet-context').length > 0;
        if (isRetweet) $(item).addClass('hidden');
        // リプライを非表示にする
        const isReply = $(item).find('.other-replies').length > 0;
        if (isReply) $(item).addClass('hidden');
    });
};

// モーダルフィルタリング用オブザーバー
const filterModalObserver = new MutationObserver((mutations) => {
    const target = mutations[0].target;
    const isContainer = target.classList.contains('chirp-container');
    if (isContainer) filterModalTimeline(target);
});

// モーダルタイムラインのフィルタリング設定を切り替える
const toggleFilterModalTimeline = (modal) => {
    $(modal).toggleClass('filter-enabled');
    // フィルタリングが有効の場合
    if ($(modal).hasClass('filter-enabled')) {
        const options = { childList: true, subtree: true };
        filterModalObserver.observe(modal.get(0), options);
        filterModalTimeline(modal.get(0));
    }
    // フィルタリングが無効の場合
    else {
        $(modal).find('.stream-item').removeClass('hidden');
        filterModalObserver.disconnect();
    }
};

// クリックイベント: カラムアイコン -> フィルタリング設定を切り替える
$(document).on('click', '.open-modal .column-type-icon', (e) => {
    const modal = $(e.target).closest('.open-modal');
    toggleFilterModalTimeline(modal);
});

// マウスオーバーイベント: カラムアイコン -> タイトルを追加する
$(document).on('mouseenter', '.open-modal .column-type-icon', (e) => {
    $(e.target).attr('title', 'Filter');
});

// マウスアウトイベント: カラムアイコン -> タイトルを消去する
$(document).on('mouseleave', '.open-modal .column-type-icon', (e) => {
    $(e.target).removeAttr('title');
});
