import { AssertionError } from 'assert';
import { createHmac, randomBytes } from 'crypto'

export interface Trend {
  name: string;
  url: string;
  query: string;
  promoted_content?: string;
  tweet_volume: number;
}

export interface Tweet {
  id: string;
  created_at: string;
  text: string;
  conversation_id: string;
  reply_setting: string;
  metrics: {
    retweet_count: number;
    quote_count: number; 
    like_count: number;
    reply_count: number; 
  }
  author: {
    id: string;
    username: string;
    name: string; 
    verified: boolean;
    protected: boolean;
    metrics: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    }
  }
  quoted_tweet?: Tweet;
  mentions?: Object;
  urls?: {
    url: string;
    expanded_url: string;
    display_url: string;
  }[]
}

export interface Profile {
  id: string;
  username: string;
  name: string; 
  verified: boolean;
  protected: boolean;
  metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  }
  bio: {
    description: string;
    created_at: string;
    location?: string;
    url?: {
      expanded_url: string;
      display_url: string;
    }
  }
  pinned_tweet?: Tweet;
}

export const emptyProfile: Profile = {
  id: '',
  username: '',
  name: '' ,
  verified: false,
  protected: false,
  metrics: {
    followers_count: 0,
    following_count: 0,
    tweet_count: 0,
  },
  bio: {
    description: '',
    created_at: '',
  }
}

export interface TwitterTweet {
  author_id: string;
  id: string;
  reply_settings: string;
  public_metrics: {
    retweet_count: number;
    quote_count: number; 
    like_count: number;
    reply_count: number; 
  }
  entities?: {
    annotations?: Array<Object>;
    cashtages?: Array<Object>;
    hashtags?: Array<Object>;
    mentions?: Array<Object>;
    urls?: {
      start: number;
      end: number;
      url: string;
      expanded_url: string;
      display_url: string;
    }[]
  }
  attachments?: {
    media_keys: Array<string>;
  }
  referenced_tweets?: {
    type: string;
    id: string;
  }[]
  conversation_id: string;
  created_at:string;
  text: string;
}

export interface TwitterUser {
  protected: boolean;
  verified: boolean;
  id: string;
  username: string;
  name: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  }
}

export interface TwitterProfile extends TwitterUser {
  description: string;
  created_at: string;
  location?: string;
  url: string;
  pinned_tweet_id?: string;
  entities?: {
    url?: {
      urls: {
        start: number;
        end: number;
        url: string;
        expanded_url: string;
        display_url: string; 
      }[]
    }
    description?: {
      urls?: {
        start: number;
        end: number;
        url: string;
        expanded_url: string;
        display_url: string; 
      }[]
    }
  }
}

export const formatNumber = (n: number): string => {
  if (n > 1000000) {
    return `${(n / 1000000).toFixed(2)}M`
  } else if (n > 100000) {
    return `${(n / 1000).toFixed(0)}K`
  } else if (n > 1000) {
    return `${(n / 1000).toFixed(1)}K`
  } else {
    return n.toString();
  }
}

export const getElapsedTime = (timestamp: string): string => {
  const prevTime = new Date(timestamp).getTime()
  const currentTime = new Date().getTime()
  const minutesElapsed = Math.round((currentTime - prevTime) / 60000)

  // depending on how much time has elapsed, we are returning either: minutes, hours, days, or the date
  if (minutesElapsed < 60) {
    return `${minutesElapsed}m ago`;
  } else if (minutesElapsed < 1440) {
    return `${Math.floor(minutesElapsed / 60)}h ago`;
  } else if (minutesElapsed < 10080) {
    return `${Math.floor(minutesElapsed / 1440)}d ago`;
  } else {
    return `${new Date(timestamp).toLocaleDateString("en-US")}`;
  }
}

const createSignature = (
  method: string,
  url: string,
  queryParams: Object = {},
  nonce: string,
  timestamp: number
): string => {
  if (
    !process.env.TWITTER_API_KEY ||
    !process.env.TWITTER_ACCESS_TOKEN ||
    !process.env.TWITTER_API_SECRET ||
    !process.env.TWITTER_ACCESS_SECRET
  ) {
    const message = 'Missing environment variables'
    throw new AssertionError({ message })
  }

  const params: any = {
    ...queryParams,
    oauth_consumer_key: process.env.TWITTER_API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp.toString(),
    oauth_token: process.env.TWITTER_ACCESS_TOKEN,
    oauth_version: "1.0",
  }

  // creates sorted string of encoded key-value pairs for each parameter
  const paramsString = Object.keys(params)
    .sort()
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])
        .replace(/!/g, "%21")}`
    })
    .join("&")

  const signatureBaseString = `${encodeURIComponent(method)}&${encodeURIComponent(url)}&${encodeURIComponent(paramsString)}`
  const signingKey = `${encodeURIComponent(process.env.TWITTER_API_SECRET)}&${encodeURIComponent(process.env.TWITTER_ACCESS_SECRET)}`
  
  const hmac = createHmac("sha1", signingKey, { encoding: "binary" })
  hmac.update(signatureBaseString)
  const buf = hmac.digest()
  const signature = buf.toString("base64")

  return encodeURIComponent(signature)
}

export const createOAuthString = (
  method: string,
  url: string,
  params: Object = {}
): string => {
  const buf = randomBytes(32)
  const oauth_nonce = buf.toString("hex")
  const timestamp = Math.floor(Date.now() / 1000)

  const signature = createSignature(
    method,
    url,
    params,
    oauth_nonce,
    timestamp
  );

  let authorizationString = `OAuth oauth_consumer_key="${process.env.TWITTER_API_KEY}", `
  authorizationString += `oauth_nonce="${oauth_nonce}", oauth_signature="${signature}", `
  authorizationString += `oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", `
  authorizationString += `oauth_token="${process.env.TWITTER_ACCESS_TOKEN}", oauth_version="1.0"`

  return authorizationString
}

export const parseTweets = (
  json: {
    data: TwitterTweet[];
    includes: {
      users: TwitterUser[];
      tweets: TwitterTweet[];
    };
  }): Tweet[] => {
  const tweetsArray = json.data
  const tweets: Tweet[] = []

  tweetsArray.forEach((twitterTweet: TwitterTweet) => {
    // get the corresponding user object for the tweet's author
    const userObject: TwitterUser = json.includes.users.find(
      (user: TwitterUser) => user.id === twitterTweet.author_id
    )!

    // there should only be one referenced tweet - the quoted tweet - as we are excluding replies/retweets
    const quotedTweetId = twitterTweet.referenced_tweets?.[0]?.id
    const quotedTweetObject: TwitterTweet = json.includes?.tweets?.find(
      (tweet: TwitterTweet) => tweet.id === quotedTweetId
    )!
    const quotedTweetUserObject: TwitterUser = json.includes.users.find(
      (user: TwitterUser) => user.id === quotedTweetObject?.author_id
    )!

    // check for URLs in the quotes tweet
    const quotedUrlArray = quotedTweetObject?.entities?.urls?.map((url) => (
      {
        url: url.url,
        expanded_url: url.expanded_url,
        display_url: url.display_url
      }
    ))

    // remove the referenced tweet link from the text of the original tweet - it will always be the last link
    if (quotedTweetId) {
      twitterTweet.text = twitterTweet.text.replace(/\s?https:\/\/t\.co\/\w+$/, "");
    }

    // get URLs from tweet
    const urlArray = twitterTweet.entities?.urls?.map((url) => (
      {
        url: url.url,
        expanded_url: url.expanded_url,
        display_url: url.display_url
      }
    ))

    const tweet: Tweet = {
      id: twitterTweet.id,
      created_at: twitterTweet.created_at,
      text: twitterTweet.text,
      conversation_id: twitterTweet.conversation_id,
      reply_setting: twitterTweet.reply_settings,
      metrics: {
        retweet_count: twitterTweet.public_metrics.retweet_count,
        quote_count: twitterTweet.public_metrics.quote_count,
        like_count: twitterTweet.public_metrics.like_count,
        reply_count: twitterTweet.public_metrics.reply_count,
      },
      author: {
        id: userObject.id,
        username: userObject.username,
        name: userObject.name,
        verified: userObject.verified,
        protected: userObject.protected,
        metrics: {
          followers_count: userObject.public_metrics.followers_count,
          following_count: userObject.public_metrics.following_count,
          tweet_count: userObject.public_metrics.tweet_count,
        }
      },
      ...(quotedTweetId && {
        quoted_tweet: {
          id: quotedTweetObject.id,
          created_at: quotedTweetObject.created_at,
          text: quotedTweetObject.text,
          conversation_id: quotedTweetObject.conversation_id,
          reply_setting: quotedTweetObject.reply_settings,
          metrics: {
            retweet_count: quotedTweetObject.public_metrics.retweet_count,
            quote_count: quotedTweetObject.public_metrics.quote_count,
            like_count: quotedTweetObject.public_metrics.like_count,
            reply_count: quotedTweetObject.public_metrics.reply_count,
          },
          author: {
            id: quotedTweetUserObject.id,
            username: quotedTweetUserObject.username,
            name: quotedTweetUserObject.name,
            verified: quotedTweetUserObject.verified,
            protected: quotedTweetUserObject.protected,
            metrics: {
              followers_count: quotedTweetUserObject.public_metrics.followers_count,
              following_count: quotedTweetUserObject.public_metrics.following_count,
              tweet_count: quotedTweetUserObject.public_metrics.tweet_count,
            }
          },
          ...(quotedUrlArray?.length && {
            urls: quotedUrlArray
          })
        }
      }),
      ...(urlArray && {
        urls: urlArray
      })
    }

    tweets.push(tweet)
  })

  return tweets
}