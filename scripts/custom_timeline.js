// カスタムタイムラインの初期状態
const initialCustomTimelineState = {
    clearedTweetIds: [],
    includeLikedTweets: true,
    minLikedCount: 0,
    clickAction: 'NONE'
};

// カスタムタイムラインの情報
let customTimelineInfo = {};

// タイムラインをカスタマイズする
const customizeTimeline = async (column) => {
    $(column).addClass('load');
    const columnId = $(column).data('column');
    const listId = $(column).data('list-id');
    const container = $(column).find('.chirp-container');
    const timelineInfo = customTimelineInfo[columnId];
    const tweets = await twitter.getListTweets(listId);
    if ($(column).hasClass('load') === false) return;
    if ($(container).scrollTop() > 0) return;
    $(column).removeClass('load');
    $(container).empty();
    tweets.forEach((tweet) => {
        // いいね済みの場合 -> キャンセル
        if (tweet.favorited && timelineInfo.includeLikedTweets === false) return;
        // いいね数が境界値未満の場合 -> キャンセル
        if (tweet.favorite_count < timelineInfo.minLikedCount) return;
        // 既読済みの場合 -> キャンセル
        if (timelineInfo.clearedTweetIds.includes(tweet.id_str)) return;
        // ツイートアイテムを追加する
        const tweetItem = component.getTweetItem(tweet);
        $(container).append(tweetItem);
    });
};

// ツイートにいいねを付ける
const likeTweet = async (tweetItem) => {
    $(tweetItem).closest('.column').removeClass('load');
    // いいね完了後のツイートを取得する
    const tweetId = $(tweetItem).data('tweet-id');
    const tweet = await twitter.likeTweet(tweetId) || await twitter.getTweet(tweetId);
    // フッターを更新する
    const footer = component.getFooterItem(tweet);
    $(tweetItem).find('footer').replaceWith(footer);
};

// クリックイベント: ツイートアイテム
$(document).on('click', '.ext-column .stream-item', (e) => {
    const column = $(e.currentTarget).closest('.column');
    const columnId = $(column).data('column');
    const timelineInfo = customTimelineInfo[columnId];
    // ツイートにいいねを付ける
    if (timelineInfo.clickAction === 'LIKE') likeTweet(e.currentTarget);
});

// クリックイベント: いいねアイテム -> ツイートにいいねを付ける
$(document).on('click', '.ext-column .tweet-favorite-item', (e) => {
    const tweetItem = $(e.currentTarget).closest('.stream-item');
    likeTweet(tweetItem);
});

// クリックイベント: アクションアイテム -> 親要素への伝播を抑止する
$(document).on('click', '.ext-column .action', (e) => e.stopPropagation());

// クリックイベント: メディアプレビュー -> メディアモーダルを表示する
$(document).on('click', '.ext-column [rel="mediaPreview"]', (e) => {
    const mediaUrl = $(e.currentTarget).data('media-url');
    const mediaModal = component.getMediaModal(mediaUrl);
    $('body').append(mediaModal);
});

// マウスダウンイベント: 設定ボタン -> 設定モーダルを表示する
$(document).on('mousedown', '.ext-column .column-settings-link', (e) => {
    const column = $(e.currentTarget).closest('.column');
    const columnId = $(column).data('column');
    const timelineInfo = customTimelineInfo[columnId];
    const settingModal = component.getSettingModal(columnId, timelineInfo);
    $('body').append(settingModal);
});

// クリックイベント: 設定完了ボタン
$(document).on('click', '.ext-setting-done', (e) => {
    // 設定を更新する
    const modal = $(e.currentTarget).closest('.ext-setting-modal');
    const columnId = $(modal).data('column');
    const timelineInfo = customTimelineInfo[columnId];
    timelineInfo.clearedTweetIds = [];
    timelineInfo.includeLikedTweets = JSON.parse($(modal).find('#includeLikedTweets').val());
    timelineInfo.minLikedCount = Number($(modal).find('#minLikedCount').val());
    timelineInfo.clickAction = $(modal).find('#clickAction').val();
    customTimelineInfo[columnId] = timelineInfo;
    // タイムラインを更新する
    const column = $(`.ext-column[data-column="${columnId}"]`);
    $(column).find('.chirp-container').empty();
    customizeTimeline(column);
    $('.ext-overlay').remove();
});

// クリックイベント: オーバーレイ -> モーダルを閉じる
$(document).on('click', '.ext-overlay', (e) => $(e.currentTarget).remove());

// クリックイベント: 設定モーダル -> 親要素への伝播を抑止する
$(document).on('click', '.ext-setting-modal', (e) => e.stopPropagation());

// クリックイベント: カラムアイコン -> ツイートをクリアする
$(document).on('click', '.ext-column .column-type-icon', (e) => {
    const column = $(e.currentTarget).closest('.column');
    const columnId = $(column).data('column');
    // クリア済みツイートを更新する
    const timelineInfo = customTimelineInfo[columnId];
    const tweetIds = $(column).find('.stream-item').map((_, item) => item.dataset.tweetId).get();
    timelineInfo.clearedTweetIds = timelineInfo.clearedTweetIds.concat(tweetIds).slice(-200);
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
    const userName = $(column).find('.attribution').text().replace('@', '');
    const lists = await twitter.getLists(userName);
    const listData = lists.find(listData => listData.name === listName);
    const listId = listData ? listData.id_str : '';
    $(column).data('list-id', listId);
    // タイムラインのデータを初期化する
    const columnId = $(column).data('column');
    customTimelineInfo[columnId] = { ...initialCustomTimelineState };
    // 定期的にタイムラインをカスタマイズする
    customizeTimeline(column);
    setInterval(() => customizeTimeline(column), 1000 * 60);
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
