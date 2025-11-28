import { track } from './analytics'

type ShareMethod = 'download' | 'clipboard' | 'native' | 'link'

export const trackHashtagViewed = (hashtag: string) => {
  track('hashtag_viewed', {
    hashtag,
    category: 'discovery',
  })
}

export const trackChallengeOpened = (challengeId: string) => {
  track('daily_challenge_opened', {
    challengeId,
    category: 'daily_challenge',
  })
}

export const trackShareClicked = (hashtag: string, method: ShareMethod) => {
  track('share_clicked', {
    hashtag,
    method,
    category: 'sharing',
  })
}
