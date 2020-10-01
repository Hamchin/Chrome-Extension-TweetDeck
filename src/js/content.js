// ========================================
//  通知送信
// ========================================

// リンクの最終部分を抽出する
const getLastPart = (link) => {
    const parts = link.split('/');
    return parts[parts.length - 1];
};

// 通知を送信する
const sendNotices = () => {
    // 自身のユーザーネーム
    const receiverName = $('.js-account-summary').find('[rel="user"]').data('user-name');
    // 通知カラム
    const columns = $('.app-columns').find('.icon-notifications').closest('.column');
    if ($(columns).length === 0) return;
    // 通知アイテム
    const items = $(columns).first().find('.stream-item');
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

// ========================================
//  カラムツイート
// ========================================

// カラムツイートをクリアする
const clearColumnTweets = (column) => {
    const settingLink = $(column).find('.column-settings-link');
    Promise.resolve()
    .then(() => new Promise((resolve) => {
        // 設定ボタンをクリックする
        if ($(settingLink).length === 0) return;
        $(settingLink).get(0).click();
        resolve();
    }))
    .then(() => new Promise((resolve) => {
        // クリアボタンをクリックする
        const clearButton = $(column).find('.icon-clear-timeline');
        if ($(clearButton).length === 0) return;
        $(clearButton).get(0).click();
        resolve();
    }))
    .then(() => new Promise(() => {
        // 設定ボタンをクリックする
        if ($(settingLink).length === 0) return;
        $(settingLink).get(0).click();
        // 設定パネルを非表示にする
        $(column).find('.column-options').hide();
    }));
};

// クリックイベント: カラムアイコン
$(document).on('click', '.app-columns .column-type-icon', (e) => {
    const column = $(e.target).closest('.column');
    clearColumnTweets(column);
});

// マウスダウンイベント: 設定ボタン
$(document).on('mousedown', '.column-settings-link', (e) => {
    const column = $(e.target).closest('.column');
    $(column).find('.column-options').show();
});

// ========================================
//  モーダルツイート
// ========================================

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

// ========================================
//  カスタムタイムライン
// ========================================

// 既読済みツイートの連想配列
const readTweetMap = new Map();

// リストのタイムラインを取得する
const getListTweets = async (listName, userName) => {
    const url = new URL(TWITTER_API_URL + '/lists/statuses');
    const body = {
        access_token: TWITTER_ACCESS_TOKEN,
        access_secret: TWITTER_ACCESS_SECRET,
        slug: listName,
        owner_screen_name: userName,
        exclude_replies: true,
        exclude_retweets: true,
        trim_user: false,
        count: 400
    };
    const request = {
        method: 'POST',
        body: JSON.stringify(body)
    };
    const tweets = await fetch(url.toString(), request)
        .then(response => response.ok ? response.json() : [])
        .catch(_ => []);
    return tweets;
};

// ツイートを個別に取得する
const getTweet = async (tweetId) => {
    const url = new URL(TWITTER_API_URL + '/statuses/show');
    const body = {
        access_token: TWITTER_ACCESS_TOKEN,
        access_secret: TWITTER_ACCESS_SECRET,
        tweet_id: tweetId,
        trim_user: false
    };
    const request = {
        method: 'POST',
        body: JSON.stringify(body)
    };
    const tweet = await fetch(url.toString(), request)
        .then(response => response.ok ? response.json() : null)
        .catch(_ => null);
    return tweet;
};

// ツイートにいいねを付ける
const likeTweet = async (tweetId) => {
    const url = new URL(TWITTER_API_URL + '/favorites/create');
    const body = {
        access_token: TWITTER_ACCESS_TOKEN,
        access_secret: TWITTER_ACCESS_SECRET,
        tweet_id: tweetId,
        trim_user: false
    };
    const request = {
        method: 'POST',
        body: JSON.stringify(body)
    };
    const tweet = await fetch(url.toString(), request)
        .then(response => response.ok ? response.json() : null)
        .catch(_ => null);
    return tweet;
};

// タイムラインをカスタマイズする
const customizeTimeline = async (column) => {
    const columnId = $(column).data('column');
    const listName = $(column).find('.column-heading').text();
    const userName = $(column).find('.attribution').text().replace('@', '');
    const content = $(column).find('.column-content');
    const container = $('<div>', { class: 'chirp-container scroll-styled-v' });
    const readTweetIds = readTweetMap.has(columnId) ? readTweetMap.get(columnId) : [];
    const tweets = await getListTweets(listName, userName);
    tweets.forEach((tweet) => {
        if (tweet.favorited) return;
        if (tweet.favorite_count === 0) return;
        if (readTweetIds.includes(tweet.id_str)) return;
        const tweetItem = getTweetItem(tweet);
        $(container).append(tweetItem);
    });
    $(content).empty();
    $(content).append(container);
    const tweetIds = tweets.map(tweet => tweet.id_str);
    const isIncluded = (tweetId) => tweetIds.includes(tweetId);
    readTweetMap.set(columnId, readTweetIds.filter(isIncluded));
};

// クリックイベント: ツイートアイテム
$(document).on('click', '.ext-column .stream-item', async (e) => {
    const targetIs = (selector) => $(e.target).closest(selector).length > 0;
    if (targetIs('.account-link')) return;
    if (targetIs('.tweet-timestamp')) return;
    if (targetIs('.media-item')) return;
    if (targetIs('.media-image')) return;
    if (targetIs('.tweet-reply-item')) return;
    if (targetIs('.tweet-retweet-item')) return;
    const tweetItem = $(e.target).closest('.stream-item');
    const tweetId = $(tweetItem).data('tweet-id');
    const tweet = await likeTweet(tweetId) || await getTweet(tweetId);
    if (tweet === null) return;
    const newTweetItem = getTweetItem(tweet);
    $(tweetItem).replaceWith(newTweetItem);
});

// クリックイベント: カラムアイコン
$(document).on('click', '.ext-column .column-type-icon', (e) => {
    const column = $(e.target).closest('.column');
    const columnId = $(column).data('column');
    const getTweetId = (_, item) => String($(item).data('tweet-id'));
    const tweetIds = $(column).find('.stream-item').map(getTweetId).get();
    const readTweetIds = readTweetMap.has(columnId) ? readTweetMap.get(columnId) : [];
    readTweetMap.set(columnId, readTweetIds.concat(tweetIds));
    $(column).find('.chirp-container').empty();
});

// ダブルクリックイベント: リストアイコン
$(document).on('dblclick', '.app-columns .icon-list', (e) => {
    const column = $(e.target).closest('.column');
    $(column).addClass('ext-column');
    customizeTimeline(column);
});

// 毎分カスタムタイムラインを更新する
setInterval(() => {
    $('.ext-column').each((_, column) => {
        const container = $(column).find('.chirp-container');
        if ($(container).scrollTop() > 0) return;
        customizeTimeline(column);
    });
}, 1000 * 60);
