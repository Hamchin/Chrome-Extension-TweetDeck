// ツイッター
const twitter = {};

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
        .catch(_ => null);
    return tweet;
};
