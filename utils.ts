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
  referenced_tweet?: Tweet;
  reference_type?: string;
  mentions?: {
    start: number;
    end: number;
    username: string;
    id: string;
  }[]
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
    mentions?: {
      start: number;
      end: number;
      username: string;
      id: string;
    }[]
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

    // check for referenced tweet
    const referencedTweetType = twitterTweet.referenced_tweets?.[0]?.type
    const referencedTweetId = twitterTweet.referenced_tweets?.[0]?.id

    // get the referenced tweet and user objects
    const referencedTweetObject: TwitterTweet = json.includes?.tweets?.find(
      (tweet: TwitterTweet) => tweet.id === referencedTweetId
    )!
    const referencedTweetUserObject: TwitterUser = json.includes.users.find(
      (user: TwitterUser) => user.id === referencedTweetObject?.author_id
    )!

    // check for URLs in the referenced tweet
    const referencedUrlArray = referencedTweetObject?.entities?.urls?.map((url) => (
      {
        url: url.url,
        expanded_url: url.expanded_url,
        display_url: url.display_url
      }
    ))

    // check for mentions in the referenced tweet
    const referencedMentionsArray = referencedTweetObject?.entities?.mentions?.map((mention) => (
      {
        start: mention.start,
        end: mention.end,
        username: mention.username,
        id: mention.id,
      }
    ))

    // if quote tweet, remove the referenced tweet link from the text of the original tweet - it will always be the last link
    if (referencedTweetType === 'quoted') {
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

    // get mentions from tweet
    const mentionsArray = twitterTweet.entities?.mentions?.map((mention) => (
      {
        start: mention.start,
        end: mention.end,
        username: mention.username,
        id: mention.id,
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
      ...(referencedTweetId && {
        referenced_tweet: {
          reference_type: referencedTweetType,
          id: referencedTweetObject.id,
          created_at: referencedTweetObject.created_at,
          text: referencedTweetObject.text,
          conversation_id: referencedTweetObject.conversation_id,
          reply_setting: referencedTweetObject.reply_settings,
          metrics: {
            retweet_count: referencedTweetObject.public_metrics.retweet_count,
            quote_count: referencedTweetObject.public_metrics.quote_count,
            like_count: referencedTweetObject.public_metrics.like_count,
            reply_count: referencedTweetObject.public_metrics.reply_count,
          },
          author: {
            id: referencedTweetUserObject.id,
            username: referencedTweetUserObject.username,
            name: referencedTweetUserObject.name,
            verified: referencedTweetUserObject.verified,
            protected: referencedTweetUserObject.protected,
            metrics: {
              followers_count: referencedTweetUserObject.public_metrics.followers_count,
              following_count: referencedTweetUserObject.public_metrics.following_count,
              tweet_count: referencedTweetUserObject.public_metrics.tweet_count,
            }
          },
          ...(referencedUrlArray?.length && {
            urls: referencedUrlArray
          }),
          ...(referencedMentionsArray?.length && {
            mentions: referencedMentionsArray
          })
        }
      }),
      ...(urlArray && {
        urls: urlArray
      }),
      ...(mentionsArray && {
        mentions: mentionsArray
      })
    }

    tweets.push(tweet)
  })

  return tweets
}