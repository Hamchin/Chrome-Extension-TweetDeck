// オブジェクト: ツイッター
const twitter = {};

// 時間データ付きツイートを取得する
twitter.getTweetWithTimeData = function (tweet) {
    const timestamp = new Date(tweet.created_at).getTime();
    const msec = Date.now() - timestamp;
    const minutes = Math.floor(msec / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const elapsed_time = { days, hours, minutes };
    return { ...tweet, timestamp, elapsed_time };
};

// リストの一覧を取得する
twitter.getLists = async function (screenName) {
    const url = new URL(TWITTER_API_URL + '/lists/list');
    const body = {
        ...TWITTER_CREDENTIALS[screenName],
        screen_name: screenName
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
twitter.getListTweets = async function (screenName, listId) {
    const url = new URL(TWITTER_API_URL + '/lists/statuses');
    const body = {
        ...TWITTER_CREDENTIALS[screenName],
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
        .then(tweets => tweets.map(tweet => this.getTweetWithTimeData(tweet)))
        .catch(_ => []);
    return tweets;
};

// ツイートを個別に取得する
twitter.getTweet = async function (screenName, tweetId) {
    const url = new URL(TWITTER_API_URL + '/statuses/show');
    const body = {
        ...TWITTER_CREDENTIALS[screenName],
        tweet_id: tweetId,
        trim_user: false
    };
    const request = {
        method: 'POST',
        body: JSON.stringify(body)
    };
    const tweet = await fetch(url.toString(), request)
        .then(response => response.ok ? response.json() : null)
        .then(tweet => tweet ? this.getTweetWithTimeData(tweet) : null)
        .catch(_ => null);
    return tweet;
};

// ツイートにいいねを付ける
twitter.likeTweet = async function (screenName, tweetId) {
    const url = new URL(TWITTER_API_URL + '/favorites/create');
    const body = {
        ...TWITTER_CREDENTIALS[screenName],
        tweet_id: tweetId,
        trim_user: false
    };
    const request = {
        method: 'POST',
        body: JSON.stringify(body)
    };
    const tweet = await fetch(url.toString(), request)
        .then(response => response.ok ? response.json() : null)
        .then(tweet => tweet ? this.getTweetWithTimeData(tweet) : null)
        .catch(_ => null);
    return tweet;
};
