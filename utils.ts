export interface Trend {
  name: string;
  url: string;
  query: string;
  promoted_content?: string;
  tweet_volume: number;
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