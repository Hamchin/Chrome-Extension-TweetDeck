// 既読済みツイートの連想配列
let readTweetMap = {};

// リストの一覧を取得する
const getLists = async (userName) => {
    const url = new URL(TWITTER_API_URL + '/lists/list');
    const body = {
        access_token: TWITTER_ACCESS_TOKEN,
        access_secret: TWITTER_ACCESS_SECRET,
        screen_name: userName
    };
    const request = {
        method: 'POST',
        body: JSON.stringify(body)
    };
    const lists = await fetch(url.toString(), request)
        .then(response => response.ok ? response.json() : [])
        .catch(_ => []);
    return lists;
};

// リストのタイムラインを取得する
const getListTweets = async (listId) => {
    const url = new URL(TWITTER_API_URL + '/lists/statuses');
    const body = {
        access_token: TWITTER_ACCESS_TOKEN,
        access_secret: TWITTER_ACCESS_SECRET,
        list_id: listId,
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
    $(column).addClass('load');
    const columnId = $(column).data('column');
    const listId = $(column).data('list-id');
    const content = $(column).find('.column-content');
    const container = $('<div>', { class: 'chirp-container scroll-styled-v' });
    const readTweetIds = readTweetMap[columnId] || [];
    const tweets = await getListTweets(listId);
    tweets.forEach((tweet) => {
        if (tweet.favorited) return;
        if (tweet.favorite_count === 0) return;
        if (readTweetIds.includes(tweet.id_str)) return;
        const tweetItem = getTweetItem(tweet);
        $(container).append(tweetItem);
    });
    const columnHasLoad = $(column).hasClass('load');
    const scrollIsTop = $(column).find('.chirp-container').scrollTop() === 0;
    if (columnHasLoad && scrollIsTop) {
        $(content).empty();
        $(content).append(container);
        const tweetIds = tweets.map(tweet => tweet.id_str);
        const isIncluded = (tweetId) => tweetIds.includes(tweetId);
        readTweetMap[columnId] = readTweetIds.filter(isIncluded);
    }
    $(column).removeClass('load');
};

// クリックイベント: ツイートアイテム
$(document).on('click', '.ext-column .stream-item', async (e) => {
    const targetIs = (selector) => $(e.target).closest(selector).length > 0;
    if (targetIs('.account-link')) return;
    if (targetIs('.tweet-timestamp')) return;
    if (targetIs('.media-item')) return;
    if (targetIs('.media-image')) return;
    if (targetIs('.quoted-tweet')) return;
    if (targetIs('.tweet-reply-item')) return;
    if (targetIs('.tweet-retweet-item')) return;
    $(e.target).closest('.ext-column').removeClass('load');
    const tweetItem = $(e.target).closest('.stream-item');
    const tweetId = $(tweetItem).data('tweet-id');
    const tweet = await likeTweet(tweetId) || await getTweet(tweetId);
    if (tweet === null) return;
    const newTweetItem = getTweetItem(tweet);
    $(tweetItem).replaceWith(newTweetItem);
});

// クリックイベント: カラムアイコン
$(document).on('click', '.ext-column .column-type-icon', (e) => {
    const column = $(e.target).closest('.ext-column');
    const columnId = $(column).data('column');
    const getTweetId = (_, item) => String($(item).data('tweet-id'));
    const tweetIds = $(column).find('.stream-item').map(getTweetId).get();
    const readTweetIds = readTweetMap[columnId] || [];
    readTweetMap[columnId] = readTweetIds.concat(tweetIds);
    $(column).find('.chirp-container').empty();
    $(column).removeClass('load');
});

// クリックイベント: メディアプレビュー
$(document).on('click', '.ext-column [rel="mediaPreview"]', (e) => {
    const mediaPreview = $(e.target).closest('[rel="mediaPreview"]');
    const mediaUrl = $(mediaPreview).data('media-url');
    const mediaModal = getMediaModal(mediaUrl);
    $('body').append(mediaModal);
});

// クリックイベント: メディアモーダル
$(document).on('click', '.ext-modal', (e) => {
    if ($(e.target).hasClass('ext-modal') === false) return;
    $('.ext-modal').remove();
});

// クリックイベント: カスタマイズボタン
$(document).on('click', '.customize-btn', async (e) => {
    const column = $(e.target).closest('.column');
    if ($(column).hasClass('ext-column')) return;
    $(column).addClass('ext-column');
    $(column).find('.column-options').remove();
    $(column).find('.chirp-container').empty();
    const listName = $(column).find('.column-heading').text();
    const userName = $(column).find('.attribution').text().replace('@', '');
    const lists = await getLists(userName);
    const listData = lists.find(listData => listData.name === listName);
    const listId = listData ? listData.id_str : '';
    $(column).data('list-id', listId);
    customizeTimeline(column);
    setInterval(() => customizeTimeline(column), 1000 * 60);
});
