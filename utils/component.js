// コンポーネント
const component = {};

// アイテム: アカウント
component.getAccountItem = function (user) {
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
component.getTimeItem = function (tweet) {
    const tweetLink = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
    const { days, hours, minutes } = tweet.elapsed_time;
    const timeText = (
        days > 0 ? days + 'd' :
        hours > 0 ? hours + 'h' :
        minutes > 0 ? minutes + 'm' : 'now'
    );
    return (`
        <time class="tweet-timestamp js-timestamp txt-mute flex-shrink--0" data-time="${tweet.timestamp}">
            <a class="txt-size-variable--12 no-wrap" href="${tweetLink}" rel="url" target="_blank">${timeText}</a>
        </time>
    `);
};

// アイテム: ヘッダー
component.getHeaderItem = function (tweet) {
    return (`
        <header class="tweet-header flex flex-row flex-align--baseline">
            ${this.getAccountItem(tweet.user)}
            ${this.getTimeItem(tweet)}
        </header>
    `);
};

// アイテム: 単体メディア
component.getMediaItem = function (media, quoted = false) {
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
component.getMediaGridItem = function (mediaList, quoted = false) {
    const mediaUrls = mediaList.map(media => media.media_url_https);
    const marginClass = quoted ? 'margin-tm' : 'margin-vm';
    const getMediaStyle = (mediaUrl) => `background-image: url(${mediaUrl}?format=jpg&name=120x120)`;
    const mediaImages = mediaUrls.map((mediaUrl) => (`
        <div class="media-image-container block position-rel">
            <a class="media-image pin-all block" rel="mediaPreview" data-media-url="${mediaUrl}" style="${getMediaStyle(mediaUrl)}"></a>
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
component.getQuotedItem = function (tweet) {
    return (`
        <div class="quoted-tweet nbfc br--14 padding-al margin-b--8 position-rel margin-tm">
            <header class="tweet-header">${this.getAccountItem(tweet.user)}</header>
            ${this.getBodyItem(tweet, quoted = true)}
        </div>
    `);
};

// アイテム: メイン
component.getBodyItem = function (tweet, quoted = false) {
    const text = tweet.full_text.replace(/https:[^\s]+$/, '').trim();
    const mediaList = tweet.extended_entities ? tweet.extended_entities.media : [];
    const mediaItem = (
        mediaList.length > 1 ? this.getMediaGridItem(mediaList, quoted) :
        mediaList.length > 0 ? this.getMediaItem(mediaList[0], quoted) : ''
    );
    const quotedItem = tweet.quoted_status ? this.getQuotedItem(tweet.quoted_status) : '';
    return (`
        <div class="tweet-body">
            <p class="tweet-text with-linebreaks">${text}</p>
            ${mediaItem}
            ${quotedItem}
        </div>
    `);
};

// アイテム: リプライ
component.getReplyItem = function () {
    return (`
        <li class="tweet-reply-item pull-left margin-r--10 is-protected-action">
            <a class="tweet-action position-rel">
                <i class="icon icon-reply txt-center pull-left"></i>
            </a>
        </li>
    `);
};

// アイテム: リツイート
component.getRetweetItem = function (tweet) {
    const isRetweet = tweet.retweeted ? 'is-retweet' : '';
    const anim = tweet.retweeted ? 'anim anim-slower anim-bounce-in' : '';
    return (`
        <li class="tweet-retweet-item pull-left margin-r--10 is-protected-action ${isRetweet}">
            <a class="tweet-action position-rel ${anim}">
                <i class="icon icon-retweet icon-retweet-toggle txt-center pull-left"></i>
                <span class="pull-right icon-retweet-toggle margin-l--3 margin-t--1 txt-size--12 retweet-count">${tweet.retweet_count}</span>
            </a>
        </li>
    `);
};

// アイテム: いいね
component.getFavoriteItem = function (tweet) {
    const isFavorite = tweet.favorited ? 'is-favorite' : '';
    const icon = tweet.favorited ? 'icon-heart-filled' : 'icon-favorite';
    const anim = tweet.favorited ? 'anim anim-slower anim-bounce-in' : '';
    return (`
        <li class="tweet-favorite-item pull-left margin-r--10 is-actionable ${isFavorite}">
            <a class="tweet-action position-rel ${anim}">
                <i class="icon ${icon} icon-favorite-toggle txt-center pull-left"></i>
                <span class="pull-right icon-favorite-toggle margin-l--2 margin-t--1 txt-size--12 like-count">${tweet.favorite_count}</span>
            </a>
        </li>
    `);
};

// アイテム: フッター
component.getFooterItem = function (tweet) {
    return (`
        <footer class="tweet-footer cf">
            <ul class="tweet-actions full-width">
                ${this.getReplyItem()}
                ${this.getRetweetItem(tweet)}
                ${this.getFavoriteItem(tweet)}
            </ul>
        </footer>
    `);
};

// アイテム: ツイート
component.getTweetItem = function (tweet) {
    const tweetItem = (`
        <article class="stream-item" data-tweet-id="${tweet.id_str}">
            <div class="item-box">
                <div class="tweet">
                    ${this.getHeaderItem(tweet)}
                    ${this.getBodyItem(tweet)}
                    ${this.getFooterItem(tweet)}
                </div>
            </div>
        </article>
    `);
    return tweetItem.replace(/\n\s+/g, '');
};

// アイテム: メディアモーダル
component.getMediaModal = function (mediaUrl) {
    const video = `<video class="ext-media" src="${mediaUrl}" controls autoplay>`;
    const image = `<img class="ext-media" src="${mediaUrl}">`;
    const media = mediaUrl.includes('.mp4') ? video : image;
    const mediaModal = `<div class="ext-overlay ovl block">${media}</div>`;
    return mediaModal;
};
