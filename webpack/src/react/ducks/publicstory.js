const SLICE = 'publicstory'
import { buildNodeTree } from 'markup/nodeTree'

// Lenses
const sliceLens = R.lensProp(SLICE)
const storyLens = R.lensProp

// Selectors
const selectorFromLens = l => R.view(R.compose(sliceLens, l))
export const getStory = id => selectorFromLens(storyLens(id))
export const getStoryTree = id => state => {
  const story = getStory(id)(state)
  if (story && story.id) {
    const obj = buildNodeTree(story)
    return obj
  }
  return story
}
export const getStoryIds = R.pipe(storyLens, R.keys)

// Actions
export const STORY_REQUESTED = 'publicstory/STORY_REQUESTED'
export const storyRequested = (id, prefetch = false) => ({
  type: STORY_REQUESTED,
  payload: { id, prefetch },
})

export const STORIES_REQUESTED = 'publicstory/STORIES_REQUESTED'
export const storiesRequested = ids => ({
  type: STORIES_REQUESTED,
  payload: { ids },
})

export const STORIES_FETCHED = 'publicstory/STORIES_FETCHED'
export const storiesFetched = data => ({
  type: STORIES_FETCHED,
  payload: data,
})

export const STORY_FETCHED = 'publicstory/STORY_FETCHED'
export const storyFetched = data => ({
  type: STORY_FETCHED,
  payload: data,
})

const mergeLeft = R.flip(R.merge)

const getReducer = ({ type, payload, error }) => {
  switch (type) {
    case STORY_REQUESTED:
      return R.over(storyLens(payload.id), mergeLeft({ fetching: true }))
    case STORIES_REQUESTED:
      return mergeLeft(
        R.pipe(R.map(R.flip(R.objOf)({ fetching: true })), R.mergeAll)(
          payload.ids,
        ),
      )
    case STORIES_FETCHED:
      return R.pipe(
        R.prop('results'),
        R.indexBy(R.prop('id')),
        R.map(R.pipe(R.assoc('HTTPstatus', 200), R.assoc('fetching', false))),
        mergeLeft,
      )(payload)

    case STORY_FETCHED:
      return R.over(
        storyLens(payload.id),
        R.pipe(mergeLeft(payload), R.assoc('fetching', false)),
      )
    default:
      return R.identity
  }
}

export default (state = {}, action) => getReducer(action)(state)
