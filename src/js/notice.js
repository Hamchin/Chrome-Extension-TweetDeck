// リンクの最終部分を抽出する
const getLastPart = (link) => {
    const parts = link.split('/');
    return parts[parts.length - 1];
};

// 通知を送信する
const sendNotices = () => {
    // 通知カラム
    const columns = $('.app-columns').find('.icon-notifications').closest('.column');
    if ($(columns).length === 0) return;
    const column = $(columns).first();
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
        const senderName = getLastPart(userLink);
        // ツイートID
        const tweetLink = $(item).find('.tweet-header').find('.tweet-timestamp').find('a').attr('href');
        const tweetId = getLastPart(tweetLink);
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

// 毎分通知を送信する
setInterval(sendNotices, 1000 * 60);
