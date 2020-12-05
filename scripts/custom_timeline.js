// カスタムタイムラインの初期状態
const initialCustomTimelineState = {
    readTweetIds: [],
    includeLikedTweets: true,
    minLikedCount: 0,
    sortBy: 'DEFAULT',
    clickAction: 'NONE'
};

// カスタムタイムラインの情報
let customTimelineInfo = {};

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
        count: 200
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
    const timelineInfo = customTimelineInfo[columnId] || { ...initialCustomTimelineState };
    const readTweetIds = timelineInfo.readTweetIds;
    const tweets = await getListTweets(listId);
    // いいね数の降順にソートする
    if (timelineInfo.sortBy === 'LIKED_COUNT') {
        tweets.sort((a, b) => b.favorite_count - a.favorite_count);
    }
    tweets.forEach((tweet) => {
        // いいね済みの場合 -> キャンセル
        if (tweet.favorited && timelineInfo.includeLikedTweets === false) return;
        // いいね数が境界値未満の場合 -> キャンセル
        if (tweet.favorite_count < timelineInfo.minLikedCount) return;
        // 既読済みの場合 -> キャンセル
        if (readTweetIds.includes(tweet.id_str)) return;
        // ツイートアイテムをコンテナへ追加する
        const tweetItem = getTweetItem(tweet);
        $(container).append(tweetItem);
    });
    // ツイートコンテナを更新する
    const columnHasLoad = $(column).hasClass('load');
    const scrollIsTop = $(column).find('.chirp-container').scrollTop() === 0;
    if (columnHasLoad && scrollIsTop) {
        $(content).empty();
        $(content).append(container);
        const tweetIds = tweets.map(tweet => tweet.id_str);
        const isIncluded = (tweetId) => tweetIds.includes(tweetId);
        timelineInfo.readTweetIds = readTweetIds.filter(isIncluded);
    }
    $(column).removeClass('load');
    customTimelineInfo[columnId] = timelineInfo;
};

// クリックイベント: ツイートアイテム
$(document).on('click', '.ext-column .stream-item', async (e) => {
    const column = $(e.target).closest('.column');
    const columnId = $(column).data('column');
    const timelineInfo = customTimelineInfo[columnId];
    if (timelineInfo === undefined) return;
    // ツイートをいいねする
    if (timelineInfo.clickAction === 'LIKE') {
        $(e.target).closest('.column').removeClass('load');
        const tweetItem = $(e.target).closest('.stream-item');
        const tweetId = $(tweetItem).data('tweet-id');
        const tweet = await likeTweet(tweetId) || await getTweet(tweetId);
        if (tweet === null) return;
        const newTweetItem = getTweetItem(tweet);
        $(tweetItem).replaceWith(newTweetItem);
    }
});

// クリックイベント: アクションアイテム
$(document).on('click', '.ext-column .action', (e) => e.stopPropagation());

// クリックイベント: メディアプレビュー -> メディアモーダルを表示する
$(document).on('click', '.ext-column [rel="mediaPreview"]', (e) => {
    const mediaPreview = $(e.target).closest('[rel="mediaPreview"]');
    const mediaUrl = $(mediaPreview).data('media-url');
    const mediaModal = getMediaModal(mediaUrl);
    $('body').append(mediaModal);
});

// マウスダウンイベント: 設定ボタン -> 設定モーダルを表示する
$(document).on('mousedown', '.ext-column .column-settings-link', (e) => {
    const column = $(e.target).closest('.column');
    const columnId = $(column).data('column');
    const timelineInfo = customTimelineInfo[columnId];
    if (timelineInfo === undefined) return;
    const settingModal = getSettingModal(columnId, timelineInfo);
    $('body').append(settingModal);
});

// クリックイベント: 設定完了ボタン -> 設定を更新する
$(document).on('click', '.ext-setting-done', (e) => {
    const modal = $(e.target).closest('.ext-setting-modal');
    if ($(modal).length === 0) return;
    // 設定を更新する
    const columnId = $(modal).data('column');
    const timelineInfo = customTimelineInfo[columnId];
    timelineInfo.readTweetIds = [];
    timelineInfo.includeLikedTweets = JSON.parse($(modal).find('#includeLikedTweets').val());
    timelineInfo.minLikedCount = Number($(modal).find('#minLikedCount').val()) || 0;
    timelineInfo.sortBy = $(modal).find('#sortBy').val();
    timelineInfo.clickAction = $(modal).find('#clickAction').val();
    customTimelineInfo[columnId] = timelineInfo;
    // タイムラインを更新する
    const column = $(`.ext-column[data-column="${columnId}"]`);
    $(column).find('.chirp-container').empty();
    customizeTimeline(column);
    $('.ext-overlay').remove();
});

// クリックイベント: オーバーレイ -> モーダルを閉じる
$(document).on('click', '.ext-overlay', (e) => {
    if ($(e.target).hasClass('ext-overlay') === false) return;
    $('.ext-overlay').remove();
});

// クリックイベント: カラムアイコン -> ツイートをクリアする
$(document).on('click', '.ext-column .column-type-icon', (e) => {
    const column = $(e.target).closest('.column');
    const columnId = $(column).data('column');
    const timelineInfo = customTimelineInfo[columnId];
    if (timelineInfo === undefined) return;
    const getTweetId = (_, item) => String($(item).data('tweet-id'));
    const tweetIds = $(column).find('.stream-item').map(getTweetId).get();
    const readTweetIds = timelineInfo.readTweetIds;
    timelineInfo.readTweetIds = readTweetIds.concat(tweetIds);
    $(column).find('.chirp-container').empty();
    $(column).removeClass('load');
});

// クリックイベント: カスタマイズボタン -> タイムラインをカスタマイズする
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

// マウスアップイベント: 設定ボタン -> カスタマイズボタンを設置する
$(document).on('mouseup', '.column-settings-link', async (e) => {
    const column = $(e.target).closest('.column');
    const icon = $(column).find('.column-type-icon');
    // リストアイコン以外の場合 -> キャンセル
    if ($(icon).hasClass('icon-list') === false) return;
    // 検索フィルターが存在しない場合 -> キャンセル
    await new Promise(resolve => setTimeout(resolve, 10));
    const filter = $(column).find('.js-search-filter');
    if ($(filter).length === 0) return;
    // ボタンを追加する
    if ($(filter).parent().find('.customize-btn').length > 0) return;
    const btnClass = 'full-width Button--link customize-btn';
    const btnText = 'Customize';
    const button = $('<button>', { class: btnClass, text: btnText });
    $(filter).after(button);
});
