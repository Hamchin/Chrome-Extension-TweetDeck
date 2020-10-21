// 対象カラム
let targetColumn = null;

// 既読済みツイートの連想配列
let readTweetMap = {};

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
    $(column).addClass('load');
    const columnId = $(column).data('column');
    const listName = $(column).find('.column-heading').text();
    const userName = $(column).find('.attribution').text().replace('@', '');
    const content = $(column).find('.column-content');
    const container = $('<div>', { class: 'chirp-container scroll-styled-v' });
    const readTweetIds = readTweetMap[columnId] || [];
    const tweets = await getListTweets(listName, userName);
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

// メッセージイベント
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message !== 'CUSTOM_TIMELINE') return;
    if (targetColumn === null) return alert('Customize Failed.');
    $(targetColumn).addClass('ext-column');
    customizeTimeline(targetColumn);
});

// コンテキストメニューイベント
document.oncontextmenu = (e) => {
    targetColumn = null;
    const columns = $(e.target).closest('.app-columns');
    if ($(columns).length === 0) return;
    const column = $(e.target).closest('.column');
    if ($(column).length === 0) return;
    if ($(column).find('.icon-list').length === 0) return;
    targetColumn = column.first();
};

// 毎分カスタムタイムラインを更新する
setInterval(() => {
    $('.ext-column').each((_, column) => customizeTimeline(column));
}, 1000 * 60);
