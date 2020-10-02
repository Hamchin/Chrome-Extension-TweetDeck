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
const getMediaItem = (mediaLink) => {
    const mediaStyle = `background-image: url(${mediaLink}?format=jpg&name=120x120)`;
    return (`
        <div class="media-preview position-rel">
            <div class="media-preview-container position-rel width-p--100 margin-vm is-paused">
                <a class="block med-link media-item media-size-small is-zoomable" href="${mediaLink}" rel="mediaPreview" target="_blank" style="${mediaStyle}"></a>
            </div>
        </div>
    `);
};

// アイテム: 複数メディア
const getMediaGridItem = (mediaLinks) => {
    const getMediaStyle = (mediaLink) => `background-image: url(${mediaLink}?format=jpg&name=120x120)`;
    const mediaImages = mediaLinks.map((mediaLink) => (`
        <div class="media-image-container block position-rel">
            <a class="pin-all media-image block" href="${mediaLink}" rel="mediaPreview" target="_blank" style="${getMediaStyle(mediaLink)}"></a>
        </div>
    `));
    return (`
        <div class="media-preview media-grid-container media-size-medium margin-vm">
            <div class="media-grid-${mediaLinks.length}">
                ${mediaImages.join('\n')}
            </div>
        </div>
    `);
};

// アイテム: メイン
const getBodyItem = (tweet) => {
    const mediaList = tweet.extended_entities ? tweet.extended_entities.media : [];
    const mediaLinks = mediaList.map(media => media.media_url_https);
    const mediaItem = (
        mediaLinks.length > 1 ? getMediaGridItem(mediaLinks) :
        mediaLinks.length > 0 ? getMediaItem(mediaLinks[0]) : ''
    );
    return (`
        <div class="tweet-body">
            <p class="tweet-text with-linebreaks">${tweet.full_text}</p>
            ${mediaItem}
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
