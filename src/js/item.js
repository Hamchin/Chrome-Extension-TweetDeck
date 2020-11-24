// アイテム: アカウント
const getAccountItem = (user) => {
    const accountLink = `https://twitter.com/${user.screen_name}`;
    return (`
        <a class="account-link link-complex block flex-auto" href="${accountLink}" rel="user" target="_blank">
            <div class="obj-left item-img tweet-img position-rel">
                <img class="tweet-avatar avatar pin-top-full-width" src="${user.profile_image_url_https}">
            </div>
            <div class="nbfc">
                <span class="account-inline txt-ellipsis">
                    <b class="fullname link-complex-target">${user.name}</b>
                    <span class="username txt-mute">${'@' + user.screen_name}</span>
                </span>
            </div>
        </a>
    `);
};

// アイテム: 経過時間
const getTimeItem = (tweet) => {
    const tweetLink = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
    const timestamp = new Date(tweet.created_at).getTime();
    const timeDiff = Date.now() - timestamp;
    const minutesDiff = Math.floor(timeDiff / 1000 / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);
    const timeText = (
        daysDiff > 0 ? daysDiff + 'd' :
        hoursDiff > 0 ? hoursDiff + 'h' :
        minutesDiff > 0 ? minutesDiff + 'm' : 'now'
    );
    return (`
        <time class="tweet-timestamp js-timestamp txt-mute flex-shrink--0" data-time="${timestamp}">
            <a class="txt-size-variable--12 no-wrap" href="${tweetLink}" rel="url" target="_blank">${timeText}</a>
        </time>
    `);
};

// アイテム: ヘッダー
const getHeaderItem = (tweet) => {
    return (`
        <header class="tweet-header flex flex-row flex-align--baseline">
            ${getAccountItem(tweet.user)}
            ${getTimeItem(tweet)}
        </header>
    `);
};

// アイテム: 単体メディア
const getMediaItem = (media, quoted = false) => {
    const variants = media.video_info ? media.video_info.variants : [];
    const videos = variants.filter(variant => variant.content_type === 'video/mp4');
    const mediaUrl = videos.length ? videos.reduce((a, b) => a.bitrate > b.bitrate ? a : b).url : media.media_url_https;
    const marginClass = quoted ? 'margin-tm' : 'margin-vm';
    const mediaStyle = `background-image: url(${media.media_url_https}?format=jpg&name=120x120)`;
    const overlay = mediaUrl.includes('.mp4') ? (`
        <div class="video-overlay icon-with-bg-round">
            <i class="icon icon-bg-dot icon-twitter-blue-color"></i>
            <i class="icon icon-play-video"></i>
        </div>
    `) : '';
    return (`
        <div class="media-preview position-rel">
            <div class="media-preview-container position-rel width-p--100 ${marginClass} is-paused">
                <a class="block med-link media-item media-size-small is-zoomable" rel="mediaPreview" data-media-url="${mediaUrl}" style="${mediaStyle}">
                    ${overlay}
                </a>
            </div>
        </div>
    `);
};

// アイテム: 複数メディア
const getMediaGridItem = (mediaList, quoted = false) => {
    const mediaUrls = mediaList.map(media => media.media_url_https);
    const marginClass = quoted ? 'margin-tm' : 'margin-vm';
    const getMediaStyle = (mediaUrl) => `background-image: url(${mediaUrl}?format=jpg&name=120x120)`;
    const mediaImages = mediaUrls.map((mediaUrl) => (`
        <div class="media-image-container block position-rel">
            <a class="pin-all media-image block" rel="mediaPreview" data-media-url="${mediaUrl}" style="${getMediaStyle(mediaUrl)}"></a>
        </div>
    `));
    return (`
        <div class="media-preview media-grid-container media-size-medium ${marginClass}">
            <div class="media-grid-${mediaUrls.length}">
                ${mediaImages.join('\n')}
            </div>
        </div>
    `);
};

// アイテム: 引用ツイート
const getQuotedItem = (tweet) => {
    return (`
        <div class="quoted-tweet nbfc br--14 padding-al margin-b--8 position-rel margin-tm is-actionable">
            <header class="tweet-header">${getAccountItem(tweet.user)}</header>
            ${getBodyItem(tweet, quoted = true)}
        </div>
    `);
};

// アイテム: メイン
const getBodyItem = (tweet, quoted = false) => {
    const text = tweet.full_text.replace(/https:[^\s]+$/, '').trim();
    const mediaList = tweet.extended_entities ? tweet.extended_entities.media : [];
    const mediaItem = (
        mediaList.length > 1 ? getMediaGridItem(mediaList, quoted) :
        mediaList.length > 0 ? getMediaItem(mediaList[0], quoted) : ''
    );
    const quotedItem = tweet.quoted_status ? getQuotedItem(tweet.quoted_status) : '';
    return (`
        <div class="tweet-body">
            <p class="tweet-text with-linebreaks">${text}</p>
            ${mediaItem}
            ${quotedItem}
        </div>
    `);
};

// アイテム: リプライ
const getReplyItem = () => {
    return (`
        <li class="tweet-reply-item pull-left margin-r--10">
            <a class="tweet-action position-rel">
                <i class="icon icon-reply txt-center pull-left"></i>
            </a>
        </li>
    `);
};

// アイテム: リツイート
const getRetweetItem = (tweet) => {
    const anim = tweet.retweeted ? 'anim anim-slower anim-bounce-in' : '';
    return (`
        <li class="tweet-retweet-item pull-left margin-r--10">
            <a class="tweet-action position-rel ${anim}">
                <i class="icon icon-retweet icon-retweet-toggle txt-center pull-left"></i>
                <span class="pull-right icon-retweet-toggle margin-l--3 margin-t--1 txt-size--12 retweet-count">${tweet.retweet_count}</span>
            </a>
        </li>
    `);
};

// アイテム: いいね
const getFavoriteItem = (tweet) => {
    const icon = tweet.favorited ? 'icon-heart-filled' : 'icon-favorite';
    const anim = tweet.favorited ? 'anim anim-slower anim-bounce-in' : '';
    return (`
        <li class="tweet-favorite-item pull-left margin-r--10">
            <a class="tweet-action position-rel ${anim}">
                <i class="icon ${icon} icon-favorite-toggle txt-center pull-left"></i>
                <span class="pull-right icon-favorite-toggle margin-l--2 margin-t--1 txt-size--12 like-count">${tweet.favorite_count}</span>
            </a>
        </li>
    `);
};

// アイテム: フッター
const getFooterItem = (tweet) => {
    return (`
        <footer class="tweet-footer cf">
            <ul class="tweet-actions full-width">
                ${getReplyItem()}
                ${getRetweetItem(tweet)}
                ${getFavoriteItem(tweet)}
            </ul>
        </footer>
    `);
};

// アイテム: ツイート
const getTweetItem = (tweet) => {
    const classList = ['stream-item', 'is-actionable'];
    if (tweet.favorited) classList.push('is-favorite');
    if (tweet.retweeted) classList.push('is-retweet');
    const tweetItem = (`
        <article class="${classList.join(' ')}" data-tweet-id="${tweet.id_str}">
            <div class="item-box">
                <div class="tweet">
                    ${getHeaderItem(tweet)}
                    ${getBodyItem(tweet)}
                    ${getFooterItem(tweet)}
                </div>
            </div>
        </article>
    `);
    return tweetItem.replace(/\n\s+/g, '');
};

// アイテム: メディアモーダル
const getMediaModal = (mediaUrl) => {
    const video = `<video class="ext-media" src="${mediaUrl}" controls autoplay>`;
    const image = `<img class="ext-media" src="${mediaUrl}">`;
    const media = mediaUrl.includes('.mp4') ? video : image;
    const mediaModal = `<div class="ext-overlay ovl block">${media}</div>`;
    return mediaModal;
};

// アイテム: 設定モーダル
const getSettingModal = (columnId, timelineInfo) => {
    const likedTweetsSetting = (`
        <div class="ext-setting-item">
            <span>Liked Tweets</span>
            <select id="includeLikedTweets">
                <option value="true" ${timelineInfo.includeLikedTweets ? 'selected' : ''}>include</option>
                <option value="false" ${timelineInfo.includeLikedTweets ? '' : 'selected'}>exclude</option>
            </select>
        </div>
    `);
    const minLikedCountSetting = (`
        <div class="ext-setting-item">
            <span>Minimum Liked Count</span>
            <input type="number" id="minLikedCount" min="0" value="${timelineInfo.minLikedCount}">
        </div>
    `);
    const sortSetting = (`
        <div class="ext-setting-item">
            <span>Sort By</span>
            <select id="sortBy">
                <option value="DEFAULT" ${timelineInfo.sortBy === 'DEFAULT' ? 'selected' : ''}>Default</option>
                <option value="LIKED_COUNT" ${timelineInfo.sortBy === 'LIKED_COUNT' ? 'selected' : ''}>Liked Count</option>
            </select>
        </div>
    `);
    const actionSetting = (`
        <div class="ext-setting-item">
            <span>Action when clicking on item</span>
            <select id="clickAction">
                <option value="NONE" ${timelineInfo.clickAction === 'NONE' ? 'selected' : ''}>None</option>
                <option value="LIKE" ${timelineInfo.clickAction === 'LIKE' ? 'selected' : ''}>Like</option>
            </select>
        </div>
    `);
    const settingModal = (`
        <div class="ext-overlay ovl block">
            <div class="ext-setting-modal" data-column="${columnId}">
                <div>
                    ${likedTweetsSetting}
                    ${minLikedCountSetting}
                    ${sortSetting}
                    ${actionSetting}
                </div>
                <button class="ext-setting-done Button--primary pull-right">Done</button>
            </div>
        </div>
    `);
    return settingModal.replace(/\n\s+/g, '');
};
