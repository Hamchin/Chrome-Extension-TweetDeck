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

// マウスオーバーイベント: カラムアイコン
$(document).on('mouseenter', '.app-columns .column-type-icon', (e) => {
    $(e.target).attr('title', 'Clear');
});

// マウスアウトイベント: カラムアイコン
$(document).on('mouseleave', '.app-columns .column-type-icon', (e) => {
    $(e.target).removeAttr('title');
});

// マウスダウンイベント: 設定ボタン
$(document).on('mousedown', '.column-settings-link', (e) => {
    const column = $(e.target).closest('.column');
    $(column).find('.column-options').show();
});
