// リンクの最終パスを抽出する
const getLastPath = (link) => {
    const paths = link.split('/');
    return paths[paths.length - 1];
};

// 通知を送信する
const sendNotices = (column) => {
    // 自分のユーザーネーム
    const receiverName = $(column).find('.attribution').text().replace('@', '');
    // 通知アイテム
    const items = $(column).find('.stream-item');
    $(items).each((_, item) => {
        // 送信済みの場合 -> スキップ
        if ($(item).hasClass('done')) return;
        // いいね以外の場合 -> スキップ
        const heart = $(item).find('.activity-header').find('.icon-heart-filled');
        if ($(heart).length === 0) return;
        // リプライの場合 -> スキップ
        const reply = $(item).find('.tweet-body').find('.other-replies');
        if ($(reply).length > 0) return;
        // 自分以外のツイートの場合 -> スキップ
        const username = $(item).find('.account-link').find('.username').first().text();
        if (username !== '@' + receiverName) return;
        // 相手のユーザーネーム
        const userLink = $(item).find('.activity-header').find('.account-link').attr('href');
        const senderName = getLastPath(userLink);
        // ツイートID
        const tweetLink = $(item).find('.tweet-header').find('.tweet-timestamp').find('a').attr('href');
        const tweetId = getLastPath(tweetLink);
        // タイムスタンプ
        const dataTime = $(item).find('.activity-header').find('.tweet-timestamp').data('time');
        const timestamp = Math.floor(dataTime / 1000);
        // 通知を送信する
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
            .then(response => response.ok ? $(item).addClass('done') : null);
    });
};

// クリックイベント: 通知送信ボタン -> 通知を送信する
$(document).on('click', '.send-notice-btn', (e) => {
    const column = $(e.target).closest('.column');
    sendNotices(column);
    if ($(column).hasClass('send-notice-enabled')) return;
    $(column).addClass('send-notice-enabled');
    setInterval(() => sendNotices(column), 1000 * 60);
});
