import type { NextApiRequest, NextApiResponse} from 'next'
import { Profile } from 'utils'

type Data = {
  me: Profile
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.redirect(307, `${process.env.TWITTER_ACCOUNT_ID}`)
}