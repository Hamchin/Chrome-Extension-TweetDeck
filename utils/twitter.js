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
twitter.getLists = async function (userName) {
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
twitter.getListTweets = async function (listId) {
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
        .then(tweets => tweets.map(tweet => this.getTweetWithTimeData(tweet)))
        .catch(_ => []);
    return tweets;
};

// ツイートを個別に取得する
twitter.getTweet = async function (tweetId) {
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
        .then(tweet => tweet ? this.getTweetWithTimeData(tweet) : null)
        .catch(_ => null);
    return tweet;
};

// ツイートにいいねを付ける
twitter.likeTweet = async function (tweetId) {
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
        .then(tweet => tweet ? this.getTweetWithTimeData(tweet) : null)
        .catch(_ => null);
    return tweet;
};
