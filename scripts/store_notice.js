// リンクの最終パスを抽出する
const getLastPath = (link) => {
    const paths = link.split('/');
    return paths[paths.length - 1];
};

// 通知を保存する
const storeNotices = (column) => {
    // 自分のユーザーネーム
    const receiverName = $(column).find('.attribution').text().replace('@', '');
    // 通知アイテム
    $(column).find('.stream-item').each((_, item) => {
        // 保存済みの場合 -> キャンセル
        if ($(item).attr('stored') !== undefined) return;
        // いいね以外の場合 -> キャンセル
        const heart = $(item).find('.activity-header .icon-heart-filled');
        if ($(heart).length === 0) return;
        // リプライの場合 -> キャンセル
        const reply = $(item).find('.tweet-body > .nbfc > .other-replies');
        if ($(reply).length > 0) return;
        // 自分以外のツイートの場合 -> キャンセル
        const screenName = $(item).find('.account-link .username').first().text();
        if (screenName !== '@' + receiverName) return;
        // 相手のユーザーネーム
        const userLink = $(item).find('.activity-header .account-link').attr('href');
        const senderName = getLastPath(userLink);
        // ツイートID
        const tweetLink = $(item).find('.tweet-header .tweet-timestamp a').attr('href');
        const tweetId = getLastPath(tweetLink);
        // タイムスタンプ
        const dataTime = $(item).find('.activity-header .tweet-timestamp').data('time');
        const timestamp = Math.floor(dataTime / 1000);
        // 通知を保存する
        const body = {
            receiver_name: receiverName,
            sender_name: senderName,
            tweet_id: tweetId,
            timestamp: timestamp
        };
        const request = {
            method: 'POST',
            body: JSON.stringify(body)
        };
        fetch(TWITTER_NOTICE_API_URL + '/notice/update', request)
            .then(response => response.ok ? $(item).attr('stored', '') : null);
    });
};

// クリックイベント: 通知保存ボタン -> 通知を保存する
$(document).on('click', '.store-notice-btn', (e) => {
    // 通知を保存する
    const column = $(e.currentTarget).closest('.column');
    storeNotices(column);
    // 設定ボタンをクリックする
    const settingLink = $(column).find('.column-settings-link');
    $(settingLink).get(0).click();
    // 定期的に通知を保存する
    if ($(column).hasClass('store-notice-enabled')) return;
    $(column).addClass('store-notice-enabled');
    setInterval(() => storeNotices(column), 1000 * 60);
});

// マウスアップイベント: 設定ボタン -> 通知保存ボタンを設置する
$(document).on('mouseup', '.column-settings-link', async (e) => {
    const column = $(e.currentTarget).closest('.column');
    const icon = $(column).find('.column-type-icon');
    // 通知アイコン以外の場合 -> キャンセル
    if ($(icon).hasClass('icon-notifications') === false) return;
    // 検索フィルターが存在しない場合 -> キャンセル
    await new Promise(resolve => setTimeout(resolve, 10));
    const filter = $(column).find('.js-search-filter');
    if ($(filter).length === 0) return;
    // ボタンを追加する
    if ($(filter).parent().find('.store-notice-btn').length > 0) return;
    const btnClass = 'full-width Button--link store-notice-btn';
    const btnText = 'Store Notifications';
    const button = $('<button>', { class: btnClass, text: btnText });
    $(filter).after(button);
});
