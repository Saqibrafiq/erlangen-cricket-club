/**
 * Storybook stand-in for every feature's `server/queries` and `server/actions` (see main.ts).
 * Feature public APIs export their server functions next to their components; stories render
 * components with props and never call these, but the bundler must not pull Payload (Node-only)
 * into the browser. A query missing here fails the Storybook build, so add new ones below.
 */
function serverOnly(name: string) {
  return (): never => {
    throw new Error(`${name} runs on the server only; pass data to the component as props.`)
  }
}

export const getCompetitionDetail = serverOnly('getCompetitionDetail')
export const getCompetitionNavigation = serverOnly('getCompetitionNavigation')
export const getCompetitionSlugs = serverOnly('getCompetitionSlugs')
export const getCompetitionStandings = serverOnly('getCompetitionStandings')
export const getContactInfo = serverOnly('getContactInfo')
export const getFixture = serverOnly('getFixture')
export const getFixturesOverview = serverOnly('getFixturesOverview')
export const getHomeData = serverOnly('getHomeData')
export const getInstagramPosts = serverOnly('getInstagramPosts')
export const getJourney = serverOnly('getJourney')
export const getLegalContent = serverOnly('getLegalContent')
export const getMatchday = serverOnly('getMatchday')
export const getMembershipInfo = serverOnly('getMembershipInfo')
export const getNewsArticle = serverOnly('getNewsArticle')
export const getNewsEntries = serverOnly('getNewsEntries')
export const getNewsList = serverOnly('getNewsList')
export const getPlayer = serverOnly('getPlayer')
export const getPlayerEntries = serverOnly('getPlayerEntries')
export const getPlayers = serverOnly('getPlayers')
export const getSponsors = serverOnly('getSponsors')
export const getStandingsOverview = serverOnly('getStandingsOverview')
export const submitContactMessageAction = serverOnly('submitContactMessageAction')
