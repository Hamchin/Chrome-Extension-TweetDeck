// タイムラインをクリアする
const clearTimeline = (column) => {
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
        $(column).find('.column-options').addClass('hidden');
    }));
};

// クリックイベント: カラムアイコン -> タイムラインをクリアする
$(document).on('click', '.app-columns .column-type-icon', (e) => {
    const column = $(e.target).closest('.column');
    clearTimeline(column);
});

// マウスアップイベント: 設定ボタン -> オプションを表示する
$(document).on('mouseup', '.column-settings-link', async (e) => {
    const column = $(e.target).closest('.column');
    $(column).find('.column-options').removeClass('hidden');
});

// マウスオーバーイベント: カラムアイコン -> タイトルを追加する
$(document).on('mouseenter', '.app-columns .column-type-icon', (e) => {
    $(e.target).attr('title', 'Clear');
});

// マウスアウトイベント: カラムアイコン -> タイトルを消去する
$(document).on('mouseleave', '.app-columns .column-type-icon', (e) => {
    $(e.target).removeAttr('title');
});
