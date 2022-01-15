// クリア済みツイートの連想配列
const clearedTweetsMap = {};

// タイムラインをカスタマイズする
const customizeTimeline = async (column) => {
    $(column).addClass('load');
    const columnId = $(column).data('column');
    const container = $(column).find('.chirp-container');
    // リストのタイムラインを取得する
    const screenName = $(column).find('.attribution').text().replace('@', '');
    const listId = $(column).data('list-id');
    const tweets = await twitter.getListTweets(screenName, listId);
    // 条件を満たさない場合 -> キャンセル
    if ($(column).hasClass('load') === false) return;
    if ($(container).scrollTop() > 0) return;
    $(column).removeClass('load');
    $(container).empty();
    // ユーザーツイートの連想配列を構築する
    const userTweetsMap = {};
    tweets.forEach((tweet) => {
        // スコアを計算する
        const divider = tweet.elapsed_time.days + 1;
        tweet.score = Math.floor(tweet.favorite_count / divider);
        // ユーザーのツイートリストに追加する
        const userId = tweet.user.id_str;
        userTweetsMap[userId] = (userTweetsMap[userId] || []).concat(tweet);
    });
    // ツイートリストをカスタマイズする
    const customTweets = [];
    for (let userId in userTweetsMap) {
        const tweets = userTweetsMap[userId];
        tweets.sort((a, b) => b.score - a.score);
        customTweets.push(...tweets.slice(0, 3));
    }
    customTweets.sort((a, b) => b.timestamp - a.timestamp);
    // ツイートリストをタイムラインに反映する
    customTweets.forEach((tweet) => {
        if (tweet.favorited) return;
        if (clearedTweetsMap[columnId].includes(tweet.id_str)) return;
        const tweetItem = component.getTweetItem(tweet);
        $(container).append(tweetItem);
    });
};

// クリックイベント: いいねアイテム -> ツイートにいいねを付ける
$(document).on('click', '.ext-column .tweet-favorite-item', async (e) => {
    const column = $(e.currentTarget).closest('.column');
    $(column).removeClass('load');
    const screenName = $(column).find('.attribution').text().replace('@', '');
    const tweetItem = $(e.currentTarget).closest('.stream-item');
    const tweetId = $(tweetItem).data('tweet-id');
    const tweet = await twitter.likeTweet(screenName, tweetId) || await twitter.getTweet(screenName, tweetId);
    const footer = component.getFooterItem(tweet);
    $(tweetItem).find('footer').replaceWith(footer);
});

// クリックイベント: メディアプレビュー -> メディアモーダルを表示する
$(document).on('click', '.ext-column [rel="mediaPreview"]', (e) => {
    const mediaUrl = $(e.currentTarget).data('media-url');
    const mediaModal = component.getMediaModal(mediaUrl);
    $('body').append(mediaModal);
});

// クリックイベント: オーバーレイ -> モーダルを閉じる
$(document).on('click', '.ext-overlay', (e) => {
    if (e.target !== e.currentTarget) return;
    $(e.currentTarget).remove();
});

// クリックイベント: カラムアイコン -> ツイートをクリアする
$(document).on('click', '.ext-column .column-type-icon', (e) => {
    const column = $(e.currentTarget).closest('.column');
    const columnId = $(column).data('column');
    // クリア済みツイートを更新する
    const tweetIds = $(column).find('.stream-item').map((_, item) => item.dataset.tweetId).get();
    clearedTweetsMap[columnId] = clearedTweetsMap[columnId].concat(tweetIds).slice(-200);
    // タイムラインのコンテナを空にする
    $(column).find('.chirp-container').empty();
    $(column).removeClass('load');
});

// クリックイベント: カスタマイズボタン -> タイムラインをカスタマイズする
$(document).on('click', '.customize-btn', async (e) => {
    // タイムラインのコンテナを生成する
    const column = $(e.currentTarget).closest('.column');
    const content = $(column).find('.column-content');
    const container = $('<div>', { class: 'chirp-container scroll-styled-v' });
    $(column).addClass('ext-column');
    $(content).empty();
    $(content).append(container);
    // 対象リストのデータを取得する
    const listName = $(column).find('.column-heading').text();
    const screenName = $(column).find('.attribution').text().replace('@', '');
    const lists = await twitter.getLists(screenName);
    const listData = lists.find(listData => listData.name === listName);
    const listId = listData ? listData.id_str : '';
    $(column).data('list-id', listId);
    // クリア済みツイートを初期化する
    const columnId = $(column).data('column');
    clearedTweetsMap[columnId] = [];
    // 定期的にタイムラインをカスタマイズする
    customizeTimeline(column);
    setInterval(() => customizeTimeline(column), CUSTOM_TIMELINE_INTERVAL);
});

// マウスアップイベント: 設定ボタン -> カスタマイズボタンを設置する
$(document).on('mouseup', '.column-settings-link', async (e) => {
    const column = $(e.currentTarget).closest('.column');
    // リストアイコン以外の場合 -> キャンセル
    const icon = $(column).find('.column-type-icon');
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
