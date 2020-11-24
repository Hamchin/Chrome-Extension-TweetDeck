// ツイートをクリアする
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

// クリックイベント: カラムアイコン -> ツイートをクリアする
$(document).on('click', '.app-columns .column-type-icon', (e) => {
    const column = $(e.target).closest('.column');
    clearColumnTweets(column);
});

// マウスアップイベント: 設定ボタン
$(document).on('mouseup', '.column-settings-link', async (e) => {
    const column = $(e.target).closest('.column');
    const icon = $(column).find('.column-type-icon');
    // オプションを表示する
    $(column).find('.column-options').show();
    // フィルターが存在しない場合 -> キャンセル
    await new Promise(resolve => setTimeout(resolve, 10));
    const filter = $(column).find('.js-search-filter');
    if ($(filter).length === 0) return;
    // ボタンを追加する
    const addButton = (btnClass, btnText) => {
        let button = $(filter).parent().find('.' + btnClass);
        if (button.length > 0) return;
        btnClass = `full-width Button--link ${btnClass}`;
        button = $('<button>', { class: btnClass, text: btnText });
        $(filter).after(button);
    };
    // 通知カラムの場合 -> 通知送信ボタンを追加する
    const isNoticeColumn = $(icon).hasClass('icon-notifications');
    if (isNoticeColumn) addButton('send-notice-btn', 'Send Notifications');
    // リストカラムの場合 -> カスタマイズボタンを追加する
    const isListColumn = $(icon).hasClass('icon-list');
    if (isListColumn) addButton('customize-btn', 'Customize');
});

// マウスオーバーイベント: カラムアイコン -> タイトルを追加する
$(document).on('mouseenter', '.app-columns .column-type-icon', (e) => {
    $(e.target).attr('title', 'Clear');
});

// マウスアウトイベント: カラムアイコン -> タイトルを消去する
$(document).on('mouseleave', '.app-columns .column-type-icon', (e) => {
    $(e.target).removeAttr('title');
});
