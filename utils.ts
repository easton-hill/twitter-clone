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
  referenced_tweets?: Object;
  mentions?: Object;
  media?: Object;
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
    urls?: Array<Object>;
  }
  attachments?: {
    media_keys: Array<string>;
  }
  referenced_tweets?: [
    {
      type: string;
      id: string;
    }
  ]
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